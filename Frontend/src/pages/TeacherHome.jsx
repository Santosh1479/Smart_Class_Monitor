import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { FaDownload } from "react-icons/fa"; // For download icon

const socket = io(`${import.meta.env.VITE_SOCKET_URL}`);

export default function TeacherHome() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const teacherId = localStorage.getItem("userId");
  const [classrooms, setClassrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: "", subject: "" });

  // Fetch classrooms created by the teacher
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/classrooms/teacher/${teacherId}`
        );
        setClassrooms(res.data);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
      }
    };

    fetchClassrooms();
  }, [teacherId]);

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/classrooms/create`,
        { ...newClassroom, teacherId }
      );
      setClassrooms([...classrooms, res.data]);
      setNewClassroom({ name: "", subject: "" });
      setShowForm(false);
      alert("Classroom created successfully!");
    } catch (err) {
      console.error("Error creating classroom:", err);
      alert(err.response?.data?.message || "Failed to create classroom");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    alert("Logged out successfully!");
    navigate("/teacher-login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1d0036] to-[#6A29FF] text-white">
      {/* Header Section */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold drop-shadow-lg">Welcome, {name}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center justify-center p-6">
        {/* Create Classroom Section */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-md rounded-2xl p-6 mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-black px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Create Classroom
            </button>
          ) : (
            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <h3 className="text-lg font-bold">Create Classroom</h3>
              <input
                type="text"
                placeholder="Classroom Name"
                value={newClassroom.name}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={newClassroom.subject}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, subject: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Display Classrooms Section */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-md rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 drop-shadow-lg">
            Your Created Classrooms
          </h2>
          {classrooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classrooms.map((classroom) => (
                <div
                  key={classroom._id}
                  onClick={() => navigate(`/camera-preview/${classroom.name}/${classroom._id}`)}
                  className="cursor-pointer p-4 bg-gray-100 rounded-lg shadow-md relative"
                >
                  <h3 className="text-lg font-bold text-black">
                    {classroom.name}
                  </h3>
                  <p className="text-sm text-gray-900">
                    Subject: {classroom.subject}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">No classrooms created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
