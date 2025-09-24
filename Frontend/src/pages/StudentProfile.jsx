import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Menu, MoreVertical } from "lucide-react"; // Add this import
import gsap from "gsap";

export default function ProfilePage() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef(null);
  const streakRef = useRef(null);

  useEffect(() => {
    const fetchStreakData = async () => {
      const data = {
        currentStreak: 5,
        bestStreak: 12,
        lastMissed: "2025-05-08",
        streakHistory: [
          { date: "2025-05-05", attended: true },
          { date: "2025-05-06", attended: true },
          { date: "2025-05-07", attended: true },
          { date: "2025-05-08", attended: false },
          { date: "2025-05-09", attended: true },
          { date: "2025-05-10", attended: true },
          { date: "2025-05-11", attended: true },
        ],
      };
      setStreakData(data);
    };
    fetchStreakData();
  }, []);

  useEffect(() => {
    if (profileRef.current) {
      gsap.fromTo(
        profileRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }
    if (streakRef.current) {
      gsap.fromTo(
        streakRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power3.out" }
      );
    }
  }, [streakData]);

  if (!user || !streakData)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-100 to-blue-50">
        <div className="text-center text-lg text-gray-500 animate-pulse">Loading profile...</div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="flex-1 flex flex-col items-center px-2 py-6 md:py-12">
        {/* Header Row */}
        <div className="w-full flex items-center justify-between mb-6 mt-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600">👤 Student Profile</h2>
          
        </div>
        <section
          ref={profileRef}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-6 md:mb-10 flex flex-col items-center"
        >
          <img
            src={"./images/profile.jpg"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-md mb-4"
          />
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">{user.name}</h2>
          <p className="text-gray-600 text-md mt-1">{user.email}</p>
          <div className="mt-2 text-sm text-gray-500 space-y-1 text-center">
            <p>
              <span className="font-medium">Role:</span> {user.role}
            </p>
            <p>
              <span className="font-medium">Joined:</span> {user.joinedOn}
            </p>
          </div>
        </section>
        <section
          ref={streakRef}
          className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 md:p-10"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-700 flex items-center gap-2">
            <span className="text-amber-500 text-2xl">🔥</span>Streak Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-8">
            <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-xl shadow">
              <p className="text-3xl font-bold text-green-700">{streakData.currentStreak}</p>
              <p className="text-sm text-gray-600 mt-1">Current Streak</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-4 rounded-xl shadow">
              <p className="text-3xl font-bold text-yellow-700">{streakData.bestStreak}</p>
              <p className="text-sm text-gray-600 mt-1">Best Streak</p>
            </div>
            <div className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-xl shadow">
              <p className="text-3xl font-bold text-red-700">{streakData.lastMissed}</p>
              <p className="text-sm text-gray-600 mt-1">Last Missed</p>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Recent Attendance</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {streakData.streakHistory.map((entry) => (
                <div
                  key={entry.date}
                  title={entry.date}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300
                    ${entry.attended ? 'bg-green-500 border-green-600' : 'bg-red-400 border-red-500'}
                  `}
                >
                  <span className="text-xs text-white font-bold">{entry.attended ? '✓' : '✗'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
