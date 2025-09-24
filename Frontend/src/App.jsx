import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import UserLogin from "./pages/userLogin";
import UserSignup from "./pages/userSignup";
import TeacherSignup from "./pages/teacherSignup";
import TeacherLogin from "./pages/teacherLogin";
import TeacherHome from "./pages/TeacherHome";
import UserHome from "./pages/home";
import StreamPage from "./pages/StreamPage";
import Navbar from "./components/NavBar";
import StudentProfile from "./pages/StudentProfile";
import FocusDetection from './pages/FocusDetection';
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
        <Route path="/classroom/:classroomId" element={<StreamPage />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/student/focus" element={<FocusDetection />} />

      </Routes>
    </Router>
  );
}

export default App;