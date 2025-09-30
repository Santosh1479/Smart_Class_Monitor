import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MoreVertical } from "lucide-react"; // or use any icon

export default function TeacherHome() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const teacherId = localStorage.getItem("userId");
  const [classrooms, setClassrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: "", subject: "" });
  const [menuOpen, setMenuOpen] = useState(null);
  const [toast, setToast] = useState("");

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
    } catch (err) {
      console.error("Error creating classroom:", err);
      console.err(err.response?.data?.message || "Failed to create classroom");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    navigate("/teacher-login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1d0036] to-[#6A29FF] text-white">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
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
                  onClick={() =>
                    navigate(
                      `/camera-preview/${classroom.name}/${classroom._id}`
                    )
                  }
                  className="cursor-pointer p-4 bg-gray-100 rounded-lg shadow-md relative"
                >
                  <div className="relative">
                    <div
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(classroom._id);
                      }}
                    >
                      <MoreVertical size={24} color="#333" />
                    </div>
                    {menuOpen === classroom._id && (
                      <div
                        className="absolute top-8 right-2 bg-white rounded shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={async (e) => {
                            e.stopPropagation();
                            // 1. Get all students of this class
                            const res = await axios.get(
                              `${import.meta.env.VITE_PY_API_URL}/class/${
                                classroom.name
                              }`
                            );
                            const students = res.data.students || [];
                            // 2. Hit holiday API
                            await axios.post(
                              `${
                                import.meta.env.VITE_BASE_URL
                              }/users/attendance-holiday`,
                              {
                                subject: classroom.name,
                                students,
                              }
                            );
                            setMenuOpen(null);
                            setToast("Marked holiday for today");
                            setTimeout(() => setToast(""), 2000);
                          }}
                        >
                          Put Holiday
                        </button>
                      </div>
                    )}
                  </div>
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
