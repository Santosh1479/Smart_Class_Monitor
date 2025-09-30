// filepath: c:\Users\Santosh\Desktop\CBC_F-05\Backend\routes\userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const userController = require('../controllers/user.controller');
const { authUser } = require('../middleware/authMiddleware');
const multer = require("multer");
const XLSX = require("xlsx");
const User = require("../models/User.model");

// Example route to get user data (protected route)
router.get('/data', authUser, userController.getUserData);

// Example route for user registration
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    userController.registerUser
);

// Example route for user login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    userController.loginuser
);

const upload = multer();

router.post("/attendance-upload", async (req, res) => {
  try {
    const subject = req.body.subject;
    const attendanceArray = req.body.attendance; // [{ USN, Status }, ...]

    if (!subject || !Array.isArray(attendanceArray)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    for (const row of attendanceArray) {
      const usn = row.USN;
      const status = row.Status?.toLowerCase() === "p" ? "p" : "a";
      if (!usn || !status) continue;

      const user = await User.findOne({ usn });
      if (user) {
        if (!user.attendance.has(subject)) user.attendance.set(subject, []);
        user.attendance.get(subject).push(status);
        await user.save();
      }
    }

    res.json({ success: true, message: "Attendance updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all students of a class as holiday ('h') for a subject
router.post("/attendance-holiday", async (req, res) => {
  try {
    const { subject, students } = req.body; // students: array of USNs

    if (!subject || !Array.isArray(students)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    for (const usn of students) {
      const user = await User.findOne({ usn });
      if (user) {
        if (!user.attendance.has(subject)) user.attendance.set(subject, []);
        user.attendance.get(subject).push("h");
        await user.save();
      }
    }

    res.json({ success: true, message: "Holiday marked for all students" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark absentees for a subject
router.post("/attendance-absent", async (req, res) => {
  try {
    const { subject, absentees } = req.body; // absentees: array of USNs

    if (!subject || !Array.isArray(absentees)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    for (const usn of absentees) {
      const user = await User.findOne({ usn });
      if (user) {
        if (!user.attendance.has(subject)) user.attendance.set(subject, []);
        user.attendance.get(subject).push("a");
        await user.save();
      }
    }

    res.json({ success: true, message: "Absentees marked for all students" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;