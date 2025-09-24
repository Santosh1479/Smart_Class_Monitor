import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("test@teac.com");
  const [password, setPassword] = useState("testpass");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`
        ${import.meta.env.VITE_BASE_URL}/teachers/login`,
        { email, password }
      );

      const teacher = res.data.teacher;
      const token = res.data.token;

      // Save all required values to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", "teacher");
      localStorage.setItem("name", teacher.name);
      localStorage.setItem("userId", teacher._id);
      localStorage.setItem("profileImage", teacher.profileImage || "");

      login(); // Let context pull from localStorage

      alert("Teacher logged in successfully!");
      navigate("/teacher-home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D0036] to-[#6A29FF] flex items-center justify-center text-white px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-2 drop-shadow-lg">
          Teacher Login
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Log in to manage your classes and students
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-300">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/teacher-signup")}
            className="text-orange-300 hover:underline font-medium"
          >
            Signup
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="inline-block text-white hover:text-indigo-300 transition"
          >
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
}