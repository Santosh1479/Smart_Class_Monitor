import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SidebarLinks({ onNavigate }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (onNavigate) onNavigate();
  };

  // Only show sidebar links if user is logged in and role is student
  if (!user || user.role !== "student") return null;

  return (
    <nav className="flex flex-col gap-4 mt-10">
      <Link to="/profile" onClick={onNavigate} className="text-indigo-700 hover:underline">Profile</Link>
      <Link to="/analytics" onClick={onNavigate} className="text-indigo-700 hover:underline">Analytics</Link>
      <Link to="/focus" onClick={onNavigate} className="text-indigo-700 hover:underline">Focus Detection</Link>
      <button
        onClick={handleLogout}
        className="text-red-600 hover:underline text-left mt-2"
      >
        Logout
      </button>
    </nav>
  );
}