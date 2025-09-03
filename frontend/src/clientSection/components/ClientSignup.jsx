import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../index.css";
import { CheckCircle, X } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import api from "../../apiCalls/axios";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu and Kashmir", "Puducherry"
].sort();

const languageOptions = [
  "English", "Angami", "Assamese", "Bengali", "Bhili", "Bhojpuri", "Bodo",
  "Chhattisgarhi", "Dogri", "Garhwali", "Garo", "Gujarati", "Haryanvi", "Hindi",
  "Kannada", "Kashmiri", "Khasi", "Kodava", "Konkani", "Kumaoni", "Ladakhi",
  "Lepcha", "Magahi", "Maithili", "Malayalam", "Manipuri (Meitei)", "Marathi",
  "Marwari", "Mizo", "Nepali", "Odia", "Pahari", "Punjabi", "Sanskrit",
  "Santali", "Sindhi", "Tamil", "Telugu", "Tulu", "Urdu", "Other"
].sort();

const ClientSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    alternate_no: "",
    password: "",
    password2: "",
    languages: [],
    dob: "",
    profile_pic: null,
    location: "",
    house_no: "",
    locality: "",
    landmark: "",
    pincode: "",
    state: "",
    city: "",
  });

  const [profileFileName, setProfileFileName] = useState("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [loading, setLoading] = useState(false); // Added for submission state
  const [error, setError] = useState(null); // Added for error display
  const [showToast, setShowToast] = useState(false); // For toast overlay

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_pic") {
      setForm({ ...form, profile_pic: files[0] });
      setProfileFileName(files[0]?.name || "");
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const toggleMultiSelect = (name, value) => {
    if (form[name].includes(value)) {
      setForm({ ...form, [name]: form[name].filter((item) => item !== value) });
    } else {
      setForm({ ...form, [name]: [...form[name], value] });
    }
  };

  // Custom toast components (same as ClientLogin)
  const CustomSuccessToast = ({ message }) => (
    <div className="custom-toast-container">
      <CheckCircle size={64} className="custom-toast-icon-success" />
      <p className="custom-toast-message">{message}</p>
    </div>
  );

  const CustomErrorToast = ({ message, closeToast }) => (
    <div className="custom-toast-container">
      <button
        onClick={() => {
          closeToast();
          setShowToast(false);
        }}
        className="custom-toast-close-btn"
      >
        <X size={24} />
      </button>
      <div className="custom-toast-icon-error-bg">
        <X size={48} className="custom-toast-icon-error" />
      </div>
      <p className="custom-toast-message">{message}</p>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    toast.dismiss(); // Clear previous toasts to prevent overlap

    // Validate passwords
    if (form.password !== form.password2) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!form.email || !form.first_name || !form.dob || !form.phone || !form.city || !form.state || !form.pincode) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("username", form.email);
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("name", `${form.first_name} ${form.last_name}`.trim());
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("confirm_password", form.password2);
    formData.append("phone", form.phone);
    formData.append("alternate_no", form.alternate_no);
    formData.append("language", form.languages.join(","));
    formData.append("dob", form.dob);
    formData.append("role", "client");
    if (form.profile_pic) formData.append("profile", form.profile_pic);
    formData.append("location", `${form.house_no} ${form.locality} ${form.landmark} ${form.pincode} ${form.state} ${form.city}`.trim());
    formData.append("house_no", form.house_no);
    formData.append("locality", form.locality);
    formData.append("landmark", form.landmark);
    formData.append("pincode", form.pincode);
    formData.append("state", form.state);
    formData.append("city", form.city);

    try {
      const response = await api.post("/userapi/register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        setShowToast(true);
        toast.success(<CustomSuccessToast message="Registration successful!" />, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          closeButton: false,
          className: "custom-toast-wrapper",
          onClose: () => setShowToast(false),
        });
        setTimeout(() => navigate("/client/login"), 1000);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      setShowToast(true);
      let errorMessage = "Something went wrong. Please try again.";
      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || "Email already exists or invalid data.";
      } else if (error.response?.status === 401) {
        errorMessage = "Unauthorized request.";
      }
      setError(errorMessage);
      toast.error(<CustomErrorToast message={errorMessage} />, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        closeButton: false,
        className: "custom-toast-wrapper",
        onClose: () => setShowToast(false),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#8080d7] p-4 font-sans relative">
      {showToast && <div className="toast-overlay absolute inset-0 z-20"></div>}
      <div className={`w-full max-w-4xl bg-[#aad9d9] rounded-lg shadow-xl p-8 md:p-12 ${showToast ? "blurred" : ""}`}>
        <h1 className="text-3xl font-bold text-center mb-10 text-[#010922]">
          Client SignUp
        </h1>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Error message */}
          {error && (
            <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
          )}

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Profile Picture</label>
              <div className="flex items-center w-full p-3 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-[#C8A165]">
                <input
                  type="file"
                  id="profilePic"
                  name="profile_pic"
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="text"
                  readOnly
                  placeholder="No file selected"
                  value={profileFileName}
                  className="flex-1 bg-transparent focus:outline-none text-gray-500"
                />
                <label
                  htmlFor="profilePic"
                  className="bg-[#010922] text-white text-sm px-4 py-1 rounded cursor-pointer hover:bg-[#8080d7] transition-colors duration-200"
                >
                  Upload
                </label>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Alternate Number</label>
              <input
                type="text"
                name="alternate_no"
                value={form.alternate_no}
                onChange={handleChange}
                placeholder="Enter alternate number"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Confirm Password</label>
              <input
                type="password"
                name="password2"
                value={form.password2}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
          </div>

          {/* Language + DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-lg">Language (Select multiple)</label>
              <div
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex justify-between items-center w-full p-3 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              >
                <div className="flex flex-wrap gap-2 text-gray-700">
                  {form.languages.length === 0 ? (
                    <span className="text-gray-400">Select languages</span>
                  ) : (
                    form.languages.map((lang, i) => (
                      <span key={i} className="bg-[#8080d7] text-white px-2 py-1 rounded text-sm">
                        {lang}
                      </span>
                    ))
                  )}
                </div>
                <FaChevronDown className="ml-2 text-gray-500" />
              </div>
              {showLangDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {languageOptions.map((lang) => (
                    <div
                      key={lang}
                      onClick={() => toggleMultiSelect("languages", lang)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${form.languages.includes(lang) ? "bg-[#f5efe5]" : ""}`}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
          </div>

          {/* Divider and Address Heading */}
          <hr className="my-10 border-gray-300" />
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Address Information</h2>

          {/* Address Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">House No.</label>
              <input
                type="text"
                name="house_no"
                value={form.house_no}
                onChange={handleChange}
                placeholder="House No."
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Locality</label>
              <input
                type="text"
                name="locality"
                value={form.locality}
                onChange={handleChange}
                placeholder="Locality"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Landmark (Optional)</label>
              <input
                type="text"
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Landmark"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="City"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-lg">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                required
                placeholder="Pincode"
                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-lg">State</label>
              <div
                onClick={() => setShowStateDropdown(!showStateDropdown)}
                className="flex justify-between items-center w-full p-3 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              >
                <span className={form.state ? "text-gray-700" : "text-gray-400"}>
                  {form.state || "Select a state"}
                </span>
                <FaChevronDown className="ml-2 text-gray-500" />
              </div>
              {showStateDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {indianStates.map((st) => (
                    <div
                      key={st}
                      onClick={() => {
                        setForm({ ...form, state: st });
                        setShowStateDropdown(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${form.state === st ? "bg-[#f5efe5]" : ""}`}
                    >
                      {st}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#010922] hover:bg-[#1A1F2E] text-white rounded-xl font-semibold transition-all duration-200 text-lg tracking-wide disabled:bg-gray-400 mt-8"
          >
            {loading ? "Signing up..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-700 text-base leading-tight">
            Already have an account?{" "}
            <Link to="/client/login" className="text-blue-600 font-bold hover:underline">
              Login here
            </Link>
          </p>
          <p className="text-gray-700 text-base mt-2 leading-tight">
            Are you an advocate?{" "}
            <Link to="/advocate/signup" className="text-blue-600 font-bold hover:underline">
              Sign up as Advocate
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
        toastClassName="custom-toast-wrapper"
        bodyClassName="custom-toast-body"
        className="toast-container-center"
      />
    </div>
  );
};

export default ClientSignup;
