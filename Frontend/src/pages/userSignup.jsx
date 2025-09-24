import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function UserSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("test1");
  const [usn, setUsn] = useState("TEST1");
  const [email, setEmail] = useState("test1@test.com");
  const [password, setPassword] = useState("testpass");
  const [branch, setBranch] = useState("Computer Science");
  const [semester, setSemester] = useState("6");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`
        ${import.meta.env.VITE_BASE_URL}/users/register`,
        {
          name,
          email,
          password,
          usn,
          branch,
          semester,
        }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("role", "student");
      localStorage.setItem("branch", branch);
      localStorage.setItem("semester", semester);
      alert("Registered successfully!");
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D0036] to-[#6A29FF] flex items-center justify-center text-white px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-2 drop-shadow-lg">
          SmartEdu
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Create your account to get started
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            type="text"
            placeholder="University Serial Number (USN)"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            required
          />

          <input
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Branch
            </option>
            <option value="CSE">CSE</option>
            <option value="ISE">ISE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          <select
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Semester
            </option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Semester {i + 1}
              </option>
            ))}
          </select>

          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition duration-300 shadow-lg"
            type="submit"
          >
            Register
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-300 hover:underline font-medium"
          >
            Log In
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/teacher-signup"
            className="inline-block text-white hover:text-indigo-300 transition"
          >
            Register as a Teacher
          </Link>
        </div>
      </div>
    </div>
  );
}