// import SupabaseClient from './utils/SupabaseClient.js';
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Home from "./common/Home.jsx";
import AdvocateList from "./common/searchpage/AdvocateList.jsx";
import Navbar from "./common/navbar/Navbar.jsx";
import Footer from "./common/footer/Footer.jsx";
import ClientWelcome from "./clientSection/pages/ClientWelcome.jsx";
import ClientLogin from "./clientSection/components/ClientLogin.jsx";
import ClientSignup from "./clientSection/components/ClientSignup.jsx";
import ClientDashboard from "./clientSection/pages/ClientDashboard.jsx";
import AdvocateWelcome from "./advocateSection/pages/AdvocateWelcome.jsx";
import AdvocateLogin from "./advocateSection/components/AdvocateLogin.jsx";
import AdvocateSignup from "./advocateSection/components/AdvocateSignup.jsx";
import AdvocateDashboard from "./advocateSection/pages/AdvocateDashboard.jsx";
import Admin from "./adminSection/Admin.jsx";
import AdminLogin from "./adminSection/AdminLogin.jsx";
import AdminDashboard from "./adminSection/AdminDashboard.jsx";
import AdvocateCard from "./common/searchpage/AdvocateCard.jsx";
import AdvocateInfo from "./adminSection/AdvocateInfo.jsx";
import { AdvocateBookingHistory } from "./advocateSection/pages/AdvocateBookingHistory.jsx";
import AdvocateProfile from "./advocateSection/pages/AdvocateProfile.jsx";
import TermsAndConditions from "./common/homepage/TermsAndConditions.jsx";
import PrivacyPolicy from "./common/homepage/PrivacyPolicy.jsx";
import FAQs from "./common/homepage/FAQs.jsx";
import AdminSignup from "./adminSection/AdminSignup.jsx";
import ChatRoomWrapper from "./route/ChatRoomWrapper.jsx";
import { AuthProvider } from "./common/AuthContext.jsx";
import AdvocateWaiting from "./advocateSection/pages/AdvocateWaiting.jsx";
// import LawyerReviewSection from "./common/searchpage/LawyerReviewSection.jsx";
import ManageSlots from "./advocateSection/pages/ManageSlots.jsx";
import ClientProfile from "./clientSection/pages/ClientProfile.jsx";
import VideoChat from "./videochatsection/VideoChat.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Navbar />
        <Home />
        <Footer />
      </div>
    ),
    children: [
      {
        path: "/termsandconditions",
        element: <TermsAndConditions />
      },
      {
        path: "/privacypolicy",
        element: <PrivacyPolicy />
      },
      {
        path: "/faqs",
        element: <FAQs />
      },
    ]
  },
  {
    path: "/advocate-list",
    element: (
      <div>
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    ),
    children: [
      {
        index: true,
        element: <AdvocateList />, 
      },
      {
        path: "lawyer/:id",
        element: <AdvocateCard />,
      },
    ],
  },
  {
    path: "/client",
    element: (
      <div>
        <Navbar />
        <ClientWelcome />
        <Footer />
      </div>
    ),
    children: [
      {
        path: "signup",
        element: <ClientSignup />,
      },
      {
        path: "login",
        element: <ClientLogin />,
      },
      {
        path: "dashboard",
        element: <ClientDashboard />,
      },
      {
        path: "profile",
        element: <ClientProfile />,
      },
    ],
  },
  {
    path: "/advocate",
    element: (
      <div>
        <Navbar />
        <AdvocateWelcome />
        <Footer />
      </div>
    ),
    children: [
      {
        path: "signup",
        element: <AdvocateSignup />,
      },
      {
        path: "login",
        element: <AdvocateLogin />,
      },
      {
        path: "dashboard",
        element: <AdvocateDashboard />,
      },
      {
        path: "history",
        element: <AdvocateBookingHistory />,
      },
      {
        path: "profile",
        element: <AdvocateProfile />
      },
      {
        path: "waiting/:id",
        element: <AdvocateWaiting />
      },
      {
        path: "manageslots",
        element: <ManageSlots />
      },
      
    ],
  },
  {
    path: "/admin",
    element: (
      <div>
        <Navbar />
        <Admin />
        <Footer />
      </div>
    ),
    children: [
      {
        path: "login",
        element: <AdminLogin />,
      },
      {
        path: "signup",
        element: <AdminSignup />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "info",
        element: <AdvocateInfo />
      },
    ],
  },
  {
    path: "chat/:bookingId",
    element: <ChatRoomWrapper />,
  },
  {
    path: "/video-chat",
    element: (
    <div>
      <Navbar />
      <VideoChat />
      <Footer />
    </div>
  )
  }
  // {
  //   path: "/TermsAndConditions",
  //   element: (
  //   <div>
  //       <Navbar />
  //       <TermsAndConditions />
  //       <Footer/>
  //     </div>
  //   )
  // },
  // {
  //   path: "/PrivacyPolicy",
  //   element: (
  //     <div>
  //       <Navbar />
  //       <PrivacyPolicy />
  //       <Footer />
  //     </div>
  //   )
  // },
  // {
  //   path: "/FAQs",
  //   element: (
  //     <div>
  //       <Navbar />
  //       <FAQs />
  //       <Footer />
  //     </div>
  //   )
  // }
]);


function App() {

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
