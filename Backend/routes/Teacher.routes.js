const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const teacherController = require("../controllers/Teacher.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Register a teacher
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("name").isLength({ min: 3 }).withMessage("Name is too short"),
    body("password").isLength({ min: 6 }).withMessage("Password is too short"),
  ],
  teacherController.registerTeacher
);

// Login a teacher
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 6 }).withMessage("Password is too short"),
  ],
  teacherController.loginTeacher
);

// Logout a teacher
router.get("/logout", authMiddleware.authUser, teacherController.logoutTeacher);

module.exports = router;