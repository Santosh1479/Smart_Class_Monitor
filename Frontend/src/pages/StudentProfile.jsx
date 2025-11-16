import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Bot } from 'lucide-react'; // Add this import
import gsap from 'gsap';
import axios from 'axios';

export default function ProfilePage() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const profileRef = useRef(null);
  const streakRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    async function fetchProfile() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data.user;
        if (!userData) return;

        setAttendanceData(userData.attendance || {});

        // Streak calculation per subject
        const attendance = userData.attendance || {};
        const streaks = {};
        Object.entries(attendance).forEach(([subject, records]) => {
          let currentStreak = 0,
            bestStreak = 0,
            lastMissed = null;
          let streak = 0;
          let streakHistory = [];
          for (let i = records.length - 1; i >= 0; i--) {
            if (records[i] === 'p' || records[i] === 'h') {
              // 'h' (holiday) does not break streak
              if (records[i] === 'p') streak++;
              if (i === records.length - 1) currentStreak = streak;
            } else {
              if (!lastMissed) lastMissed = `Missed at #${i + 1}`;
              if (streak > bestStreak) bestStreak = streak;
              streak = 0;
            }
            streakHistory.unshift({
              date: `Day ${i + 1}`,
              attended: records[i] === 'p',
              status: records[i],
            });
          }
          if (streak > bestStreak) bestStreak = streak;
          streaks[subject] = {
            currentStreak,
            bestStreak,
            lastMissed: lastMissed || 'Never missed',
            streakHistory: streakHistory.slice(-7),
          };
        });
        setStreakData(streaks);
      } catch (err) {
        setAttendanceData({});
        setStreakData(null);
        console.error('Profile fetch error:', err);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileRef.current) {
      gsap.fromTo(
        profileRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      );
    }
    if (streakRef.current) {
      gsap.fromTo(
        streakRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power3.out' },
      );
    }
  }, [streakData]);

  async function sendMessage() {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'student', text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/gemini-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text }),
      });
      const data = await res.json();
      const botMsg = {
        sender: 'bot',
        text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't answer.",
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: 'Error contacting Gemini API.' }]);
    }
  }

  useEffect(() => {
    setChatMessages([]);
  }, []);

  if (!attendanceData) return <div>Loading your profile...</div>;

  if (!user || !streakData || !attendanceData)
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
            src={'./images/profile.jpg'}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-md mb-4"
          />
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">{user.name}</h2>
          <p className="text-gray-600 text-md mt-1">{user.email}</p>
          <div className="mt-2 text-sm text-gray-500 space-y-1 text-center"></div>
        </section>
        {/* REMOVE STREAK INSIGHTS SECTION */}
        {/* Only show attendance summary */}
        <section className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 md:p-10 mt-6">
          <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-700">
            Attendance (Last 30 Days)
          </h3>
          {Object.entries(attendanceData).map(([subject, records]) => {
            const last30 = records.slice(-30);
            const presentCount = last30.filter((x) => x === 'p').length;
            return (
              <div key={subject} className="mb-6">
                <div className="font-semibold mb-1">{subject}</div>
                <div className="w-full bg-gray-300 rounded h-6 relative">
                  <div
                    className="bg-green-500 h-6 rounded"
                    style={{
                      width: `${(presentCount / 30) * 100}%`,
                      transition: 'width 0.5s',
                    }}
                  />
                  <span className="absolute left-2 top-1 text-sm text-white font-bold">
                    {presentCount} / 30 classes attended
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Bot Icon */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg"
          onClick={() => setChatOpen((v) => !v)}
          title="Ask the chatbot"
        >
          <Bot size={32} />
        </button>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-8 bg-white rounded-xl shadow-2xl w-80 max-h-[60vh] flex flex-col z-50">
          <div className="p-3 border-b font-bold text-indigo-700 flex items-center gap-2">
            <Bot size={20} /> Chatbot
            <button
              className="ml-auto text-xs text-gray-400 hover:text-red-500"
              onClick={() => setChatOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm p-2 rounded-lg ${
                  msg.sender === 'student'
                    ? 'bg-indigo-100 text-right ml-10'
                    : 'bg-gray-100 text-left mr-10'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <form
            className="flex border-t p-2 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              className="flex-1 px-2 py-1 rounded border"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me anything..."
            />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
