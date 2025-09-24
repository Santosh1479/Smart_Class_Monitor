import React from 'react';
import { useNavigate } from 'react-router-dom';

const Start = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D0036] to-[#6A29FF] text-white flex flex-col items-center justify-between p-4">
      {/* Main Content Section */}
      <div className="flex flex-col sm:flex-row justify-center items-center w-full max-w-screen-lg p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl mt-24">
        {/* Image Section */}
        <div className="w-full sm:w-1/2 p-4 mb-6 sm:mb-0">
          <img
            src="/images/start.jpg" // Replace with actual image link
            alt="Smart Learning"
            className="rounded-lg shadow-md w-full"
          />
        </div>

        {/* Info Section */}
        <div className="w-full sm:w-1/2 p-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Welcome to Smart Learning</h1>
          <p className="text-lg mb-6">
            Smart Learning is an advanced platform that revolutionizes the way we approach education. With AI-powered tools, we provide personalized learning experiences tailored to your needs.
          </p>

          {/* Get Started Button */}
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-md w-full sm:w-auto"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 text-center text-sm text-white">
        <p>Smart Learning © 2025 | All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Start;