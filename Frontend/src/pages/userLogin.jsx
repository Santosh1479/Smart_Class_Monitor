import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`
        ${import.meta.env.VITE_BASE_URL}/users/login`,
        { email, password }
      );

      if (response.status === 200) {
        const { user, token } = response.data;

        // Save to context
        login(user, token);

        // Save to localStorage (optional if context already handles this)
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("name", user.name);
        localStorage.setItem("role", "user");

        // Redirect based on role
        if (user.role === "teacher") {
          navigate("/teacher-home");
        } else {
          navigate("/profile");
        }
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }

    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1d0036] to-[#6A29FF] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 animate-fade-in">
        <h2 className="text-4xl font-bold text-white text-center mb-2 drop-shadow-lg">
          Login
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Log in to continue your learning journey
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-300">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-violet-300 hover:underline font-medium"
          >
            Register
          </button>
        </div>

        <Link
          to="/teacher-login"
          className="block mt-4 text-center text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg py-2 transition duration-300 shadow-md"
        >
          Teacher Login
        </Link>
      </div>
    </div>
  );
}