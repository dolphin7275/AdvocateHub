/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../../apiCalls/axios';

const AdvocateSignup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    cnic: "",
    education: '',
    barCouncilCert: null,
    aadhaarCard: null,
    panCard: null,
    additionalCert: null,
    profilePicture: null,
    location: "",
    courtLevel: "",
    caseTypes: "",
    availability: "",
    experience: "",
    pricing: "",
    languages: "Hindi",
    // Address fields
    houseNo: "",
    locality: "",
    landmark: "",
    pincode: "",
    state: "",
    city: ""
  });
  const caseOptions = [
  "Civil Cases",
  "Criminal Cases",
  "Family Law Cases",
  "Property and Land Disputes",
  "Corporate and Commercial Cases",
  "Consumer Protection Cases",
  "Labour and Employment Cases",
  "Taxation Cases",
  "Intellectual Property Cases",
  "Environmental Law Cases",
  "Constitutional and Writ Petitions",
  "Cybercrime and IT Law Cases",
  "Banking and Finance Disputes",
  "Insurance Claims",
  "Human Rights and Public Interest Litigations (PILs)",
  "Arbitration and Alternative Dispute Resolution (ADR)",
  "Education and Service Matters",
  "Immigration and Citizenship Cases",
  "Media and Entertainment Law Cases",
  "Real Estate and Tenancy Disputes"
].sort();



  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  // Auto-fill state & city from pincode
  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, pincode: value });

    if (value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            state: postOffice.State,
            city: postOffice.District
          }));
        }
      } catch (err) {
        console.error("Error fetching pincode data:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setPasswordError("");

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match!");
      setLoading(false);
      return;
    }

    const data = new FormData();
    // Backend required fields
    data.append("username", formData.email);
    data.append("name", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phoneNumber);
    data.append("password", formData.password);
    data.append("confirm_password", formData.confirmPassword);
    data.append("role", "lawyer");

    // Other fields
    data.append("cnic", formData.cnic);
    data.append("education", formData.education);
    data.append("location", `${formData.houseNo} ${formData.locality} ${formData.landmark} ${formData.city} ${formData.state} ${formData.pincode}`.trim());
    data.append("court_level", formData.courtLevel);
    data.append("case_types", formData.caseTypes);
    data.append("availability", formData.availability);
    data.append("experience", formData.experience);
    data.append("price", formData.pricing);
    data.append("languages", formData.languages);

    // Address fields
    data.append("house_no", formData.houseNo);
    data.append("locality", formData.locality);
    data.append("landmark", formData.landmark);
    data.append("pincode", formData.pincode);
    data.append("state", formData.state);
    data.append("city", formData.city);

    // Files
    data.append("bar", formData.barCouncilCert);
    data.append("aadhar", formData.aadhaarCard);
    data.append("pan", formData.panCard);
    data.append("degree", formData.additionalCert);
    data.append("profile", formData.profilePicture);

    try {
      await api.post('/userapi/register/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/advocate/waiting/:id');
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        console.error('Backend response:', err.response.data);
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#8080d7] p-4 sm:p-6 font-sans flex flex-col items-center">
      

      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6 sm:space-y-8">
        
{/* SECTION 1 – Personal Info */}
<div className="mt-4">
  
  {/* <h3 className="font-extrabold text-gray-800 text-xl sm:text-2xl leading-none mb-2 sm:mb-4 text-center sm:text-left">
    Section 1 – Personal Information
  </h3> */}
  <div className="bg-[#aad9d9] p-4 sm:p-8 rounded-xl shadow-lg">
    <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-10 pt-4  text-center">
        Advocate Sign up 
      </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-16 gap-y-4 sm:gap-y-6">
      <div className="flex flex-col">
        <label htmlFor="fullName" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your name"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="email" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your Email"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="phoneNumber" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Enter your phone number"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="profilePicture" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Profile Picture
        </label>
        <label className="p-3 border border-gray-300 rounded-lg bg-white text-sm flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-[#7a5b2c]">
          <span className="text-gray-500 truncate pr-2">
            {formData.profilePicture ? formData.profilePicture.name : ""}
          </span>
          <span className="inline-block px-4 sm:px-5 py-2 bg-[#0d0d5d] text-white text-sm font-semibold rounded-md hover:bg-[#0d0d5d] transition-colors duration-300">
            Upload
          </span>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            onChange={handleChange}
            className="hidden"
          />
        </label>

        {formData.profilePicture && (
          <button
            type="button"
            onClick={() => {
              const imgWindow = window.open("", "ImagePreview", "width=400,height=300");
              imgWindow.document.write(
                `<html><head><title>Preview</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
                   <img src="${URL.createObjectURL(formData.profilePicture)}" style="max-width:300px;max-height:200px;border-radius:6px;" />
                 </body></html>`
              );
            }}
            className="mt-2 inline-block px-4 sm:px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-800 transition-colors duration-300"
          >
            View
          </button>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="password" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your Password"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="confirmPassword" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Enter your Password"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="cnic" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Registration Number
        </label>
        <input
          id="cnic"
          name="cnic"
          value={formData.cnic}
          onChange={handleChange}
          placeholder="Enter your Registration Number"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="education" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Highest Education
        </label>
        <input
          id="education"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Enter your education details"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>

      {/* AOR Number & Current Location side by side */}
      <div className="flex flex-col">
        <label htmlFor="aorNumber" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          AOR Number
        </label>
        <input
          id="aorNumber"
          name="aorNumber"
          value={formData.aorNumber}
          onChange={handleChange}
          placeholder="Enter your AOR Number"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="currentLocation" className="font-extrabold text-gray-800 text-lg sm:text-xl mb-2">
          Current Location
        </label>
        <input
          id="currentLocation"
          name="currentLocation"
          value={formData.currentLocation}
          onChange={handleChange}
          placeholder="Enter your Current Location"
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm sm:text-base"
        />
      </div>
    </div>
  </div>
</div>


{/* SECTION 2 – KYC Upload */}
<div>
  {/* <h3 className="font-extrabold text-gray-800 text-xl sm:text-2xl leading-none mb-2 sm:mb-4 text-center sm:text-left">
    Section 2 – KYC Upload
  </h3> */}
  <div className="bg-[#aad9d9] p-4 sm:p-8 rounded-xl shadow-lg">
    <div className="grid grid-cols-1 sm:grid-cols-[max-content_max-content] gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6 items-center">
      {(() => {
        const showImagePopup = (file) => {
          const imgWindow = window.open("", "_blank", "width=400,height=400");
          imgWindow.document.write(
            `<html><head><title>Preview</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
              <img src="${URL.createObjectURL(file)}" style="max-width:100%;max-height:100%;object-fit:contain;" />
            </body></html>`
          );
        };

        return (
          <>
            {/* COP Certificate */}
            <label htmlFor="barCouncilCert" className="font-extrabold text-gray-800 text-lg sm:text-xl">
              Upload COP Certificate
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <label className="p-3 border border-gray-300 rounded-lg bg-[#332060] text-sm cursor-pointer text-white font-semibold hover:bg-[#39247a] transition-colors duration-300 max-w-full flex items-center">
                <span className="text-white text-base truncate max-w-[200px]" title={formData.barCouncilCert ? formData.barCouncilCert.name : ""}>
                  {formData.barCouncilCert ? formData.barCouncilCert.name : "Upload"}
                </span>
                <input
                  type="file"
                  id="barCouncilCert"
                  name="barCouncilCert"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {formData.barCouncilCert && (
                <button
                  type="button"
                  onClick={() => showImagePopup(formData.barCouncilCert)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-800 transition-colors duration-300"
                >
                  View
                </button>
              )}
            </div>

            {/* Aadhaar */}
            <label htmlFor="aadhaarCard" className="font-extrabold text-gray-800 text-lg sm:text-xl">
              Upload Aadhaar Card
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <label className="p-3 border border-gray-300 rounded-lg bg-[#332060] text-sm cursor-pointer text-white font-semibold hover:bg-[#39247a] transition-colors duration-300 max-w-full flex items-center">
                <span className="text-white text-base truncate max-w-[200px]" title={formData.aadhaarCard ? formData.aadhaarCard.name : ""}>
                  {formData.aadhaarCard ? formData.aadhaarCard.name : "Upload"}
                </span>
                <input
                  type="file"
                  id="aadhaarCard"
                  name="aadhaarCard"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {formData.aadhaarCard && (
                <button
                  type="button"
                  onClick={() => showImagePopup(formData.aadhaarCard)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-800 transition-colors duration-300"
                >
                  View
                </button>
              )}
            </div>

            {/* PAN */}
            <label htmlFor="panCard" className="font-extrabold text-gray-800 text-lg sm:text-xl">
              Upload PAN Card
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <label className="p-3 border border-gray-300 rounded-lg bg-[#332060] text-sm cursor-pointer text-white font-semibold hover:bg-[#39247a] transition-colors duration-300 max-w-full flex items-center">
                <span className="text-white text-base truncate max-w-[200px]" title={formData.panCard ? formData.panCard.name : ""}>
                  {formData.panCard ? formData.panCard.name : "Upload"}
                </span>
                <input
                  type="file"
                  id="panCard"
                  name="panCard"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {formData.panCard && (
                <button
                  type="button"
                  onClick={() => showImagePopup(formData.panCard)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-800 transition-colors duration-300"
                >
                  View
                </button>
              )}
            </div>

            {/* Additional Bar Council Certificate */}
            <label
              htmlFor="additionalCert"
              className="font-extrabold text-gray-800 text-lg sm:text-xl"
            >
              Upload Bar Council Certificate
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg bg-[#332060] text-sm flex items-center justify-center cursor-pointer text-white font-semibold hover:bg-[#39247a] transition-colors duration-300">
                <span className="text-white text-base break-all text-center">
                  {formData.additionalCert
                    ? formData.additionalCert.name
                    : "Upload"}
                </span>
                <input
                  type="file"
                  id="additionalCert"
                  name="additionalCert"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {formData.additionalCert && (
                <button
                  type="button"
                  onClick={() => showImagePopup(formData.additionalCert)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-800 transition-colors duration-300"
                >
                  View
                </button>
              )}
            </div>
          </>
        );
      })()}
    </div>
  </div>
</div>
 


        {/* SECTION 3 – Practice Info */}
        <div>
          {/* <h3 className="font-extrabold text-gray-800 text-2xl leading-none mb-4">
            Section 3 – Practice Information
          </h3> */}
          <div className="bg-[#aad9d9] p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
              {/* <div className="flex flex-col">
                <label
                  htmlFor="location"
                  className="font-extrabold text-gray-800 text-xl mb-2"
                >
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                  required
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7a5b2c]"
                />
              </div> */}

              <div className="flex flex-col relative">
                <label
                  htmlFor="courtLevel"
                  className="font-extrabold text-gray-800 text-xl mb-2"
                >
                  Court Level
                </label>
                <select
                  id="courtLevel"
                  name="courtLevel"
                  value={formData.courtLevel}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#7a5b2c]"
                >
                  <option value="" disabled>
                    Choose
                  </option>
                  <option value="Supreme court">Supreme Court</option>
                  <option value="High court">High Court</option>
                  <option value="District court">District Court</option>
                  <option value="Session court">Subordinate Court</option>
                  <option value="Specialized court">Specialized Tribunals</option>
                  <option value="Executive/Revenue Court">Executive/Revenue Court</option>
                </select>

                <div
                  className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
                  style={{ top: "calc(50% + 0.5rem)" }}
                >
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                  </svg>
                </div>
              </div>
              

              <div className="flex flex-col">
  <label
    htmlFor="caseTypes"
    className="font-extrabold text-gray-800 text-xl mb-2"
  >
    Case types
  </label>
  <select
    id="caseTypes"
    name="caseTypes"
    value={formData.caseTypes}
    onChange={handleChange}
    className="p-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7a5b2c]"
  >
    <option value="">Choose</option>
    {caseOptions.map((option, index) => (
      <option key={index} value={option}>
        {option}
      </option>
    ))}
  </select>
</div>


              <div className="flex flex-col">
                <label
                  htmlFor="availability"
                  className="font-extrabold text-gray-800 text-xl mb-2"
                >
                  Availability
                </label>
                <input
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  placeholder=""
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7a5b2c]"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="experience"
                  className="font-extrabold text-gray-800 text-xl mb-2"
                >
                  Experience
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Enter years of Experience"
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7a5b2c]"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="pricing"
                  className="font-extrabold text-gray-800 text-xl mb-2"
                >
                  Pricing per Session (₹)
                </label>
                <input
                  id="pricing"
                  name="pricing"
                  type="number"
                  value={formData.pricing}
                  onChange={handleChange}
                  placeholder="Enter your Price"
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7a5b2c]"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="location"
                  className="font-extrabold text-gray-800 text-xl mb-2"
                >
                  Languages
                </label>
                <input
                  id="languages"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="Enter your Languages"
                  required
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7a5b2c]"
                />
              </div>



            </div>
          </div>
        </div>

        {/* SECTION 4 – Address Information */}
        <div>
          {/* <h3 className="font-extrabold text-gray-800 text-2xl leading-none mb-4">
            Section 4 – Address Information
          </h3> */}
          <div className="bg-[#aad9d9] p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
              <div className="flex flex-col">
                <label htmlFor="houseNo" className="font-extrabold text-gray-800 text-xl mb-2">
                  House No
                </label>
                <input
                  id="houseNo"
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                  placeholder="Enter House No"
                  required
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="locality" className="font-extrabold text-gray-800 text-xl mb-2">
                  Locality
                </label>
                <input
                  id="locality"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="Enter Locality"
                  required
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="landmark" className="font-extrabold text-gray-800 text-xl mb-2">
                  Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Enter Landmark"
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="pincode" className="font-extrabold text-gray-800 text-xl mb-2">
                  Pincode
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter Pincode"
                  required
                  className="p-3 border border-gray-300 rounded-lg bg-white text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="state" className="font-extrabold text-gray-800 text-xl mb-2">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  readOnly
                  className="p-3 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="city" className="font-extrabold text-gray-800 text-xl mb-2">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  readOnly
                  className="p-3 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-10 py-3 bg-[#0d0d5d] text-white text-lg font-semibold rounded-lg cursor-pointer mx-auto block transition-colors duration-300 hover:bg-[#000043] shadow-lg mt-10"
        >
          Create Account
        </button>
      </form>

      <div className="text-center mt-8 space-y-2">
        <p className="text-[#4a2e0a]">
          Already have an account?{" "}
          <a href="/advocate/login" className="text-blue-600 font-bold hover:underline">
            Login here
          </a>
        </p>
        <p className="text-[#4a2e0a]">
          Are you a Client?{" "}
          <a href="/client/Signup" className="text-blue-600 font-bold hover:underline">
            Sign up as Client
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdvocateSignup;
