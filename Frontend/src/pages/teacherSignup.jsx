import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function TeacherSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("test");
  const [email, setEmail] = useState("test@teac.com");
  const [password, setPassword] = useState("testpass");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/teachers/register`, { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.teacher._id);
      localStorage.setItem("name", res.data.teacher.name);
      localStorage.setItem("role", "teacher");
      alert("Teacher registered successfully!");
      navigate("/teacher-home");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D0036] to-[#6A29FF] flex items-center justify-center text-white px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-2 drop-shadow-lg">
          Teacher Signup
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Create your account to manage your classes and students
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
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
            Signup
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/teacher-login")}
            className="text-orange-300 hover:underline font-medium"
          >
            Login
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/register"
            className="inline-block text-white hover:text-indigo-300 transition"
          >
            User Signup
          </Link>
        </div>
      </div>
    </div>
  );
}