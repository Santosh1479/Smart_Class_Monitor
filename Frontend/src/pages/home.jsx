import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("branch");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1d0036] to-[#6A29FF] text-white px-4">
      {/* Header Section */}
      <div className="p-4 mt-20 backdrop-blur-lg shadow-md rounded-lg w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold drop-shadow-lg">
          Welcome to Your Dashboard
        </h1>
      </div>
      {/* You can add other dashboard content here if needed */}
    </div>
  );
};

export default Home;