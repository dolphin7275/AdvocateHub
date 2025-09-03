import React, { useEffect, useState } from 'react';
import { Hourglass, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdvocateWaiting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [advocateName, setAdvocateName] = useState("");

  useEffect(() => {
    if (location.state && location.state.fullname) {
      localStorage.setItem('fullName', location.state.fullname);
      setAdvocateName(location.state.fullname);
    } else {
      const storedName = localStorage.getItem('fullName');
      setAdvocateName(storedName || "Advocate");
    }
  }, [location.key, location.state /*, user */]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-l from-[#8080d7] to-[#D6D6F9] relative text-center px-4">
      <div className="absolute top-30 text-4xl font-bold text-[#010922] opacity-90 z-10">
        Welcome {advocateName}!
      </div>

      <div className="bg-[#aad9d9] p-8 rounded-xl shadow-md text-[#010922] max-w-lg z-10 relative flex flex-col items-center hover:scale-102 hover:bg-[#7ECCCC]">
        <p className="text-xl font-sans font-bold text-center leading-relaxed">
          Your account is under review. Your profile <br />
          will be created after approval on behalf of <br />
          your provided documents.
        </p>

        <div className="relative w-16 h-16 mt-6">
          <Hourglass className="text-white w-16 h-16" />
          <div className="absolute bottom-0 right-0 z-10 bg-white rounded-full p-1 shadow">
            <Clock className="text-blue-500 w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateWaiting;
