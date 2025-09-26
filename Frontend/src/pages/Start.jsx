import React from 'react';
import { useNavigate } from 'react-router-dom';

const Start = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D0036] to-[#6A29FF] text-white flex flex-col items-center justify-between p-4">
      {/* Main Content Section */}
      <div className="flex flex-col sm:flex-row justify-center items-center w-full max-w-screen-lg p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl mt-24">
        {/* Image Section */}
        <div className="w-full sm:w-1/2 p-4 mb-6 sm:mb-0">
          <img
            src="/images/start.jpg"
            alt="Smart Learning"
            className="rounded-lg shadow-md w-full"
          />
        </div>

        {/* Info Section */}
        <div className="w-full sm:w-1/2 p-4 text-center flex flex-col items-center">
          <h1 className="text-2xl sm:text-4xl font-semibold mb-4">Welcome to EDU_Scope</h1>
          {/* <p>(Education+Observation,Monitoring,Insight)</p> */}
          <div
            
            className="px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto mb-6"
          >
            Get Started
          </div>
          {/* Role Icons Section */}
          <div className="flex gap-8 justify-center mt-2">
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigate('/login')}
              title="Student Login"
            >
              <img
                src="/images/student.jpg"
                alt="Student"
                className="rounded-full shadow-lg w-16 h-16 object-cover border-8 border-green-500 hover:scale-105 transition-transform duration-200"
              />
              <span className="mt-2 text-base font-medium">Student</span>
            </div>
            <div
              className="flex flex-col items-center justify-center cursor-pointer"
              onClick={() => navigate('/teacher-login')}
              title="Teacher Login"
            >
              <img
                src="/images/teacher.jpg"
                alt="Teacher"
                className="rounded-full shadow-lg w-16 h-16 object-cover border-8 border-blue-500 hover:scale-105 transition-transform duration-200"
              />
              <span className="mt-2 text-base font-medium">Teacher</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-200">
            Click your role icon to go to the respective login page.
          </p>
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