import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import UserLogin from "./pages/userLogin";
import UserSignup from "./pages/userSignup";
import TeacherSignup from "./pages/teacherSignup";
import TeacherLogin from "./pages/teacherLogin";
import TeacherHome from "./pages/TeacherHome";
import UserHome from "./pages/home";
import Navbar from "./components/NavBar";
import StudentProfile from "./pages/StudentProfile";
import FocusDetection from './pages/FocusDetection';
import CameraPreview from "./pages/CameraPreview";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserSignup />} />
        <Route path="/teacher-signup" element={<TeacherSignup />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-home" element={<TeacherHome />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/student/focus" element={<FocusDetection />} />
        <Route path="/camera-preview/:classroomId" element={<CameraPreview />} />
        <Route path="/camera-preview/:className/:_id" element={<CameraPreview />} />
      </Routes>
    </Router>
  );
}

export default App;