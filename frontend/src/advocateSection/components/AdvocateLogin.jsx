import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle, X } from 'lucide-react';
import api from '../../apiCalls/axios';

const AdvocateLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/userapi/login/", {
        username: formData.email,
        password: formData.password,
      });

      const { access, refresh } = res.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      const roleRes = await api.get("/userapi/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const { role, details } = roleRes.data;
      const status = details?.profile_status;
      localStorage.setItem("role", role);

      if (role !== "lawyer") {
        toast.error("You are not registered as a lawyer.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        if (status === "approved") {
          navigate("/advocate/dashboard");
        } else if (status === "pending") {
          navigate("/advocate/waiting");
        } else if (status === "rejected") {
          navigate("/");
        } else {
          toast.error("Unknown profile status. Contact support.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please check your credentials.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row lg:flex-row min-h-screen bg-[#8080d7] text-[#010922] font-sans">
      
      {/* Left Section */}
      <div className="w-full md:w-full lg:w-1/2 flex justify-center items-center p-8 max-md:py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            <span className="text-white">ADVOCATE</span>{' '}
            <span className="text-[#010922]">HUB</span>
          </h1>
          <p className="mt-4 text-white text-md md:text-lg italic">Seek for the truth</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-full lg:w-1/2 flex justify-center items-center px-6 py-10 md:px-12 lg:p-20 bg-[#8080d7]">
        <div className="w-full max-w-md mx-auto bg-[#aad9d9] p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#010922] text-center">
              ADVOCATE LOGIN
            </h2>

            {/* Email */}
            <div>
              <label className="block font-semibold mb-2 text-[#010922]">Email</label>
              <input
                type="email"
                name="email"
                placeholder="username@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[#010922] placeholder-gray-700 bg-[#F3F4F6] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#010922] transition-all duration-200 hover:shadow-md hover:border-[#7aafa8]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold mb-2 text-[#010922]">Password</label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[#010922] placeholder-gray-700 bg-[#F3F4F6] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#010922] transition-all duration-200 hover:shadow-md hover:border-[#7aafa8]"
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right text-sm">
              <Link to="/forgot-password" className="text-[#010922] hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Error */}
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#010922] hover:bg-[#1A1F2E] text-white rounded-xl font-semibold transition-all duration-200 text-lg tracking-wide disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>

            {/* Signup Links */}
            <div className="mt-8 text-center text-sm text-[#010922]">
              <p className="text-base font-medium">Don't have an account?</p>
              <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/client/signup" className="text-[#010922] text-sm font-medium hover:underline hover:text-[#1A1F2E] transition-colors duration-200">
                  Sign up as Client
                </Link>
                <Link to="/advocate/signup" className="text-[#010922] text-sm font-medium hover:underline hover:text-[#1A1F2E] transition-colors duration-200">
                  Sign up as Lawyer
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AdvocateLogin;
