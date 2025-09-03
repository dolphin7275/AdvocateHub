import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdPending } from "react-icons/md";
import { useNavigate, Outlet } from "react-router-dom";
import api from "../apiCalls/axios";


const LogoutModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center text-black">
      <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
      <p>Are you sure you want to logout?</p>
      <div className="mt-6 flex justify-center gap-4">
        <button
          className="bg-[#aad9d9] text-[#010922] px-4 py-2 rounded hover:bg-[#c3e3e3]"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={onConfirm}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("All Profiles");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [lawyers, setLawyers] = useState([]);

  
  const fetchAllLawyers = async () => {
    try {
      const res = await api.get("/userapi/all-lawyers/");
      setLawyers(res.data);
    } catch (err) {
      console.error("Failed to fetch lawyers", err);
    }
  };

  
  const getFilteredProfiles = () => {
    switch (activeLink) {
      case "Pending Profiles":
        return lawyers.filter(
          (profile) => profile.profile_status?.toLowerCase() === "pending"
        );
      case "Approved Profiles":
        return lawyers.filter(
          (profile) => profile.profile_status?.toLowerCase() === "approved"
        );
      case "Rejected Profiles":
        return lawyers.filter(
          (profile) => profile.profile_status?.toLowerCase() === "rejected"
        );
      default:
        return lawyers;
    }
  };

  const handleReviewClick = (profile) => {
    navigate("/admin/info", { state: { profile } });
  };

  
  useEffect(() => {
    fetchAllLawyers();
  }, []);

  const filteredProfiles = getFilteredProfiles();

  return (
    
    <div className="relative min-h-screen text-[#010922] bg-[#010922]">
      
      <header className="sticky top-0 z-40 flex items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#8080d7] text-white shadow-md">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-[#aad9d9] p-2 rounded-lg"
        >
          
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      
      <aside
        className={`fixed top-0 left-0 z-50 bg-[#010922] w-64 h-full p-4 shadow-lg space-y-4 text-white
        transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-white"
          >
            
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ul className="space-y-4 pl-2 mt-2 text-sm sm:text-base">
          <li>
            <button
              onClick={() => {
                setActiveLink("All Profiles");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-2 px-2 py-1 rounded w-full text-left transition-colors ${activeLink === "All Profiles" ? "bg-[#8cb7b7] text-[#010922]" : "bg-[#aad9d9] text-[#010922] hover:bg-[#8cb7b7]"}`}
            >
              <span>All Profiles</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveLink("Pending Profiles");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-2 px-2 py-1 rounded w-full text-left transition-colors ${activeLink === "Pending Profiles" ? "bg-[#8cb7b7] text-[#010922]" : "bg-[#aad9d9] text-[#010922] hover:bg-[#8cb7b7]"}`}
            >
              <span>Pending Profiles</span>
              <MdPending className="ml-auto text-[#010922]" />
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveLink("Approved Profiles");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-2 px-2 py-1 rounded w-full text-left transition-colors ${activeLink === "Approved Profiles" ? "bg-[#8cb7b7] text-[#010922]" : "bg-[#aad9d9] text-[#010922] hover:bg-[#8cb7b7]"}`}
            >
              <span>Approved Profiles</span>
              <FaCheckCircle className="ml-auto text-[#010922]" />
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveLink("Rejected Profiles");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-2 px-2 py-1 rounded w-full text-left transition-colors ${activeLink === "Rejected Profiles" ? "bg-[#8cb7b7] text-[#010922]" : "bg-[#aad9d9] text-[#010922] hover:bg-[#8cb7b7]"}`}
            >
              <span>Rejected Profiles</span>
              <FaTimesCircle className="ml-auto text-[#010922]" />
            </button>
          </li>
          <li>
            <button
              className="flex items-center gap-2 px-2 py-1 rounded w-full text-left bg-[#aad9d9] text-[#010922] hover:bg-[#8cb7b7] transition-colors"
              onClick={() => setLogoutConfirm(true)}
            >
              <span>Logout</span>
              <FaSignOutAlt className="ml-auto text-[#010922]" />
            </button>
          </li>
        </ul>
      </aside>

      
      <main className="pt-4 sm:pt-6 px-4 sm:px-6">
        <div className="bg-[#010922] text-white shadow-md overflow-hidden rounded">
          <div className="max-h-[400px] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-[#aad9d9] text-[#010922] sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold uppercase">No</th>
                    <th className="px-3 py-2 text-left font-bold uppercase">Profile ID</th>
                    <th className="px-3 py-2 text-left font-bold uppercase">Name</th>
                    <th className="px-3 py-2 text-left font-bold uppercase">Email</th>
                    <th className="px-3 py-2 text-left font-bold uppercase">CNIC</th>
                    <th className="px-3 py-2 text-left font-bold uppercase">Status</th>
                    <th className="px-3 py-2 text-left font-bold uppercase">Signup Date</th>
                    <th className="px-3 py-2 text-left font-bold uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-[#b8b8eb] text-[#010922] divide-y divide-gray-300">
                  {filteredProfiles.map((profile, index) => {
                    const status = profile.profile_status?.toLowerCase();
                    return (
                      <tr key={profile.id || index} className="hover:bg-[#9999e5]">
                        <td className="px-3 py-2 whitespace-nowrap">{index + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap">Adv#{100 + profile.id}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{profile.user_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{profile.user_email}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{profile.cnic}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold">
                            {status === "pending" && (
                              <>
                                <MdPending className="text-[#010922]" />
                                Pending
                              </>
                            )}
                            {status === "approved" && (
                              <>
                                <FaCheckCircle className="text-[#010922]" />
                                Approved
                              </>
                            )}
                            {status === "rejected" && (
                              <>
                                <FaTimesCircle className="text-[#010922]" />
                                Rejected
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{profile.signup_date?.slice(0, 10)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {status === "approved" && <span className="font-semibold">Yes</span>}
                          {status === "rejected" && <span className="font-semibold">No</span>}
                          {status === "pending" && (
                            <span
                              className="font-semibold flex items-center gap-1 cursor-pointer text-[#010922] hover:underline"
                              onClick={() => handleReviewClick(profile)}
                            >
                              Review <FaSearch className="inline text-[#010922]" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Outlet />
      </main>

    
      {logoutConfirm && (
        <LogoutModal
          onCancel={() => setLogoutConfirm(false)}
          onConfirm={() => {
            localStorage.clear();
            navigate("/admin/login");
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
