/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import '../../index.css';

import { CheckCircle, X } from 'lucide-react';
import api from "../../apiCalls/axios"

const ClientLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ✅ Custom toast components
  const CustomSuccessToast = ({ message, closeToast }) => (
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

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log("Login data:", formData);

    try {
      // JWT login using email as username
      const res = await api.post("/userapi/login/", {
        username: formData.email,
        password: formData.password,
      });

      const { access, refresh } = res.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // set default Authorization header for all future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      const roleRes = await api.get("/userapi/me/");
      const role = roleRes.data.role;
      localStorage.setItem("role", role);

      // If user is not client ❌
      if (role !== "client") {
        setShowToast(true);
        toast.error(
          <CustomErrorToast message="You are not registered as a client." />,
          { 
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            closeButton: false,
            className: "custom-toast-wrapper",
            onClose: () => setShowToast(false)
          }
        );
        return;
      }

      // ✅ Success toast
      setShowToast(true);
      toast.success(
        <CustomSuccessToast message="Login successful!" />,
        { 
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          closeButton: false,
          className: "custom-toast-wrapper",
          onClose: () => setShowToast(false)
        }
      );

      // redirect to client dashboard
      setTimeout(() => navigate("/client/dashboard"), 1000);
 
    } catch (err) {
      console.error(err);
      setShowToast(true);

      if (err.response?.status === 401) {
        toast.error(
          <CustomErrorToast message="Invalid email or password." />,
          { 
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            closeButton: false,
            className: "custom-toast-wrapper",
            onClose: () => setShowToast(false)
          }
        );
      } else {
        toast.error(
          <CustomErrorToast message="Login failed. Please try again later." />,
          { 
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            closeButton: false,
            className: "custom-toast-wrapper",
            onClose: () => setShowToast(false)
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row lg:flex-row min-h-screen bg-[#8080d7] text-[#010922] font-sans relative">
      {/* Blur overlay when toast is visible */}
      {showToast && <div className="toast-overlay absolute inset-0 z-20"></div>}
      
      {/* Left section */}
      <div className={`w-full md:w-full lg:w-1/2 flex justify-center items-center p-8 max-md:py-12 ${showToast ? 'blurred' : ''}`}>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            <span className="text-white">ADVOCATE</span>{" "}
            <span className="text-[#010922]">HUB</span>
          </h1>
          <p className="mt-4 text-white text-md md:text-lg italic">Seek for the truth</p>
        </div>
      </div>

      {/* Right section */}
      <div className={`w-full md:w-full lg:w-1/2 flex justify-center items-center px-6 py-10 md:px-12 lg:p-20 bg-[#8080d7] ${showToast ? 'blurred' : ''}`}>
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-[#aad9d9] p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-300 space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#010922] text-center">
            CLIENT LOGIN
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

          {/* Forgot password */}
          <div className="text-right text-sm">
            <a href="/forgot-password" className="text-[#010922] hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-600 text-sm mb-2">{error}</div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#010922] hover:bg-[#1A1F2E] text-white rounded-xl font-semibold transition-all duration-200 text-lg tracking-wide disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>

          {/* Sign up options */}
          <div className="mt-8 text-center text-sm text-[#010922]">
            <p className="text-base font-medium">Don't have an account?</p>
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
              <a href="/client/signup" className="text-[#010922] text-sm font-medium hover:underline hover:text-[#1A1F2E] transition-colors duration-200">
                Sign up as Client
              </a>
              <a href="/advocate/signup" className="text-[#010922] text-sm font-medium hover:underline hover:text-[#1A1F2E] transition-colors duration-200">
                Sign up as Advocate
              </a>
            </div>
          </div>
        </form>
      </div>

      {/* Toast container */}
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

export default ClientLogin;
