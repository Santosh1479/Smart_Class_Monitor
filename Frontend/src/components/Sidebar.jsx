import React from "react";
import SidebarLinks from "./SidebarLinks";

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <div
      className={`fixed top-10 right-0 h-screen w-64 bg-white shadow-xl z-40 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out sm:static sm:translate-x-0 sm:w-64`}
    >
      <button
        className="absolute top-4 right-4 text-gray-600 sm:hidden"
        onClick={() => setIsOpen(false)}
        aria-label="Close sidebar"
      >
        ✕
      </button>
      <SidebarLinks onNavigate={() => setIsOpen(false)} />
    </div>
  );
}
