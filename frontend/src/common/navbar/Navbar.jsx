import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Assets from "../../assets/assets.js";

const Navbar = () => {
  const [openC, setOpenC] = useState(false);
  const [openA, setOpenA] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'client' or 'advocate'
  const navigate = useNavigate();

  useEffect(() => {
    // Function to check login status
    const checkLoginStatus = () => {
      const token = localStorage.getItem("accessToken");
      const storedRole = localStorage.getItem("role");
      
      // Map roles to userType for navbar
      let userType = null;
      if (storedRole === "client") {
        userType = "client";
      } else if (storedRole === "lawyer") {
        userType = "advocate";
      }
      
      // Debug logging
      console.log("Token:", !!token);
      console.log("Stored Role:", storedRole);
      console.log("Mapped User Type:", userType);
      
      setIsLoggedIn(!!token);
      setUserType(userType);
    };

    // Check login status on component mount
    checkLoginStatus();

    // Listen for custom login/logout events
    const handleAuthChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('authChanged', handleAuthChange);
    
    // Also listen for storage changes (in case of login from another tab)
    window.addEventListener('storage', handleAuthChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const closeAllMenus = () => {
    setOpenC(false);
    setOpenA(false);
    setOpenProfile(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserType(null);
    closeAllMenus();
    
    // Dispatch custom event to update navbar across the app
    window.dispatchEvent(new Event('authChanged'));
    
    navigate("/"); // Redirect to home
  };

  return (
    <div className="bg-[#010922] shadow-md px-3 py-2 sm:px-4 md:px-6 lg:px-10 relative z-50">
      <div className="flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            navigate("/");
            closeAllMenus();
          }}
        >
          <img className="w-40 sm:w-44 md:w-48 lg:w-50 mt-2 ml-1 sm:ml-2" src={Assets.logoText} alt="logo" />
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setOpenC(false);
              setOpenA(false);
              setOpenProfile(false);
            }}
            className="text-white focus:outline-none p-2 rounded-md hover:bg-[#6E7582] transition-colors duration-200"
          >
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu */}
        <div
          className={`${
            menuOpen
              ? "block absolute top-full left-0 w-full bg-[#010922] shadow-lg py-4 px-3 sm:px-4 border-t border-[#6E7582]"
              : "hidden"
          } lg:flex lg:items-center lg:flex-grow lg:justify-end lg:gap-10 lg:mt-0 lg:py-0 lg:px-0 lg:border-0 lg:shadow-none`}
        >
          {/* Navigation Links - Only show if not logged in */}
          {!isLoggedIn && (
            <div className="mb-6 lg:mb-0">
              <ul className="flex flex-col gap-2 lg:flex-row lg:gap-6 text-[#F8F8F5] w-full lg:w-auto">
                <li>
                  <NavLink
                    to="/"
                    className="text-lg sm:text-xl font-semibold block py-3 px-4 rounded-[10px] hover:bg-[#6E7582] hover:text-[#F8F8F5] transition-colors duration-200 text-center lg:text-left"
                    onClick={closeAllMenus}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/advocate-list"
                    className="text-lg sm:text-xl font-semibold block py-3 px-4 rounded-[10px] hover:bg-[#6E7582] hover:text-[#F8F8F5] transition-colors duration-200 text-center lg:text-left"
                    onClick={closeAllMenus}
                  >
                    Listing
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full lg:w-auto lg:flex-row lg:gap-4">
            
            {isLoggedIn ? (
              // If logged in → Show profile dropdown based on user type
              <div className="relative w-full lg:w-auto">
                <button
                  onClick={() => {
                    setOpenProfile(!openProfile);
                  }}
                  className="bg-[#aad9d9] text-[#010922] text-base sm:text-lg font-semibold px-6 py-3 sm:py-2 rounded-md hover:scale-105 transition-transform duration-200 cursor-pointer w-full text-center flex items-center justify-center gap-2"
                >
                  {/* Profile Icon */}
                  <svg 
                    className="w-5 h-5" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Profile
                </button>
                {openProfile && (
                  <div className="absolute top-full left-0 right-0 lg:right-auto lg:left-0 mt-2 bg-[#aad9d9] rounded-md shadow-lg z-10 w-full lg:w-48 p-2">
                    <button
                      onClick={() => {
                        navigate("/");
                        closeAllMenus();
                      }}
                      className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => {
                        navigate("/advocate-list");
                        closeAllMenus();
                      }}
                      className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                    >
                      Listing
                    </button>
                    
                    {/* Advocate-specific menu items */}
                    {userType === 'advocate' && (
                      <>
                        <button
                          onClick={() => {
                            navigate("/advocate/manage-slots");
                            closeAllMenus();
                          }}
                          className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                        >
                          Manage Slots
                        </button>
                        <button
                          onClick={() => {
                            navigate("/advocate/dashboard");
                            closeAllMenus();
                          }}
                          className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                        >
                          Dashboard
                        </button>
                      </>
                    )}
                    
                    {/* Client-specific menu items */}
                    {userType === 'client' && (
                      <button
                        onClick={() => {
                          navigate("/client/bookings");
                          closeAllMenus();
                        }}
                        className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                      >
                        My Bookings
                      </button>
                    )}
                    
                    {/* Logout button */}
                    <hr className="my-2 border-[#010922]" />
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-3 lg:py-2 font-semibold text-left text-red-600 hover:bg-red-600 hover:text-white rounded-sm cursor-pointer w-full transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // If not logged in → Show Client & Advocate buttons
              <>
                {/* CLIENT */}
                <div className="relative w-full lg:w-auto">
                  <button
                    onClick={() => {
                      setOpenC(!openC);
                      setOpenA(false);
                    }}
                    className="bg-[#aad9d9] text-[#010922] text-base sm:text-lg font-semibold px-8 sm:px-10 py-3 sm:py-2 rounded-md hover:scale-105 transition-transform duration-200 cursor-pointer w-full text-center"
                  >
                    CLIENT
                  </button>
                  {openC && (
                    <div className="absolute top-full left-0 right-0 lg:right-auto lg:left-0 mt-2 bg-[#aad9d9] rounded-md shadow-lg z-10 w-full lg:w-36 p-2">
                      <button
                        onClick={() => {
                          navigate("/client/signup");
                          closeAllMenus();
                        }}
                        className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                      >
                        SignUp
                      </button>
                      <button
                        onClick={() => {
                          navigate("/client/login");
                          closeAllMenus();
                        }}
                        className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>

                {/* ADVOCATE */}
                <div className="relative w-full lg:w-auto">
                  <button
                    onClick={() => {
                      setOpenA(!openA);
                      setOpenC(false);
                    }}
                    className="bg-[#aad9d9] text-[#010922] text-base sm:text-lg font-semibold px-6 sm:px-6 py-3 sm:py-2 rounded-md cursor-pointer hover:scale-105 transition-transform duration-200 w-full text-center"
                  >
                    ADVOCATE
                  </button>
                  {openA && (
                    <div className="absolute top-full left-0 right-0 lg:right-auto lg:left-0 mt-2 bg-[#aad9d9] shadow-lg rounded-md p-2 z-20 w-full lg:w-36">
                      <button
                        onClick={() => {
                          navigate("/advocate/signup");
                          closeAllMenus();
                        }}
                        className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                      >
                        SignUp
                      </button>
                      <button
                        onClick={() => {
                          navigate("/advocate/login");
                          closeAllMenus();
                        }}
                        className="block px-4 py-3 lg:py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;


// import React, { useState, useEffect } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import Assets from "../../assets/assets.js";

// const Navbar = () => {
//   const [openC, setOpenC] = useState(false);
//   const [openA, setOpenA] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check login status on component mount
//     const token = localStorage.getItem("access");
//     setIsLoggedIn(!!token);
//   }, []);

//   const closeAllMenus = () => {
//     setOpenC(false);
//     setOpenA(false);
//     setMenuOpen(false);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");
//     setIsLoggedIn(false);
//     navigate("/"); // Redirect to home
//   };

//   return (
//     <div className="bg-[#010922] shadow-md px-4 py-3 sm:px-6 lg:px-10 relative z-50">
//       <div className="flex justify-between items-center">
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => {
//             navigate("/");
//             closeAllMenus();
//           }}
//         >
//           <img className="w-50 mt-2 ml-2" src={Assets.logoText} alt="logo" />
//           {/* <img className="h-8 mt-4" src={Assets.logoText} alt="text" /> */}
//         </div>

//         {/* Mobile Menu Button */}
//         <div className="lg:hidden">
//           <button
//             onClick={() => {
//               setMenuOpen(!menuOpen);
//               setOpenC(false);
//               setOpenA(false);
//             }}
//             className="text-white focus:outline-none p-2 rounded-md hover:bg-[#6E7582]"
//           >
//             <svg
//               className="w-8 h-8"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               {menuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>
//         </div>

//         {/* Menu */}
//         <div
//           className={`${
//             menuOpen
//               ? "block absolute top-full left-0 w-full bg-[#010922] shadow-lg py-4 flex flex-col items-center gap-4 mt-4"
//               : "hidden"
//           } lg:flex lg:items-center lg:flex-grow lg:justify-end lg:gap-10 mt-4 sm:mt-0 lg:pr-10`}
//         >
//           <ul className="flex flex-col lg:flex-row lg:gap-6 text-[#F8F8F5] text-center w-full lg:w-auto mb-4 lg:mb-0">
//             <li>
//               <NavLink
//                 to="/"
//                 className="text-xl font-semibold block py-2 px-4 rounded-[10px] hover:bg-[#6E7582] hover:text-[#F8F8F5] transition-colors duration-200"
//                 onClick={closeAllMenus}
//               >
//                 Home
//               </NavLink>
//             </li>
//             <li>
//               <NavLink
//                 to="/advocate-list"
//                 className="text-xl font-semibold block py-2 px-4 rounded-[10px] hover:bg-[#6E7582] hover:text-[#F8F8F5] transition-colors duration-200"
//                 onClick={closeAllMenus}
//               >
//                 Listing
//               </NavLink>
//             </li>
//           </ul>

//           <div className="flex flex-col gap-3 w-full lg:w-auto px-4 lg:px-0 justify-center lg:flex-row lg:gap-4">
//             {isLoggedIn ? (
//               // 🔹 If logged in → Logout button
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 text-white text-md font-semibold px-6 py-2 rounded-md hover:bg-red-600 transition-transform duration-200 w-full text-center"
//               >
//                 Logout
//               </button>
//             ) : (
//               // 🔹 If not logged in → Show Client & Advocate buttons
//               <>
//                 {/* CLIENT */}
//                 <div className="relative w-full sm:w-auto">
//                   <button
//                     onClick={() => {
//                       setOpenC(!openC);
//                       setOpenA(false);
//                     }}
// // <<<<<<< Updated upstream
//                     className="bg-[#aad9d9] text-[#010922] text-md font-semibold px-10 py-2 rounded-md hover:scale-105 transition-transform duration-200 cursor-pointer w-full text-center"
//                   >
//                     CLIENT
// {/* =======
//                     className="block px-4 py-2 font-semibold text-center text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                   >
//                     SignUp
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate("/client/login");
//                       closeAllMenus();
//                     }}
//                     className="block px-4 py-2 font-semibold text-center text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                   >
//                     Login 
// >>>>>>> Stashed changes */}
//                   </button>
//                   {openC && (
//                     <div className="absolute top-full left-0 mt-2 bg-[#aad9d9] rounded-md shadow-lg z-10 w-full sm:w-36 p-2">
//                       <button
//                         onClick={() => {
//                           navigate("/client/signup");
//                           closeAllMenus();
//                         }}
//                         className="block px-4 py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                       >
//                         SignUp
//                       </button>
//                       <button
//                         onClick={() => {
//                           navigate("/client/login");
//                           closeAllMenus();
//                         }}
//                         className="block px-4 py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                       >
//                         Login
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* ADVOCATE */}
//                 <div className="relative w-full sm:w-auto">
//                   <button
//                     onClick={() => {
//                       setOpenA(!openA);
//                       setOpenC(false);
//                     }}
// // <<<<<<< Updated upstream
//                     className="bg-[#aad9d9] text-[#010922] text-md font-semibold px-6 py-2 rounded-md cursor-pointer hover:scale-105 transition-transform duration-200 w-full text-center"
//                   >
//                     ADVOCATE
// {/* =======
//                     className="block px-4 py-2 font-semibold text-center text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                   >
//                     SignUp
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate("/advocate/signup");
//                       closeAllMenus();
//                     }}
//                     className="block px-4 py-2 font-semibold text-center text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                   >
//                     SignUp
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate("/advocate/login");
//                       closeAllMenus();
//                     }}
//                     className="block px-4 py-2 font-semibold text-center text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                   >
//                     Login
// >>>>>>> Stashed changes */}
//                   </button>
//                   {openA && (
//                     <div className="absolute top-full left-0 mt-2 bg-[#aad9d9] shadow-lg rounded-md p-2 z-20 w-full sm:w-36">
//                       <button
//                         onClick={() => {
//                           navigate("/advocate/signup");
//                           closeAllMenus();
//                         }}
//                         className="block px-4 py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                       >
//                         SignUp
//                       </button>
//                       <button
//                         onClick={() => {
//                           navigate("/advocate/login");
//                           closeAllMenus();
//                         }}
//                         className="block px-4 py-2 font-semibold text-left text-[#010922] hover:bg-[#010922] hover:text-[#F8F8F5] rounded-sm cursor-pointer w-full transition-colors duration-200"
//                       >
//                         Login
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;
