import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SidebarLinks({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (onNavigate) onNavigate();
  };

  return (
    <nav className="flex flex-col gap-4 mt-10">
      <Link to="/profile" onClick={onNavigate} className="text-indigo-700 hover:underline">Profile</Link>
      <Link to="/analytics" onClick={onNavigate} className="text-indigo-700 hover:underline">Analytics</Link>
      <Link to="/focus" onClick={onNavigate} className="text-indigo-700 hover:underline">Focus Detection</Link>
      {/* Add more sidebar links as needed */}
      <button
        onClick={handleLogout}
        className="text-red-600 hover:underline text-left mt-2"
      >
        Logout
      </button>
    </nav>
  );
}