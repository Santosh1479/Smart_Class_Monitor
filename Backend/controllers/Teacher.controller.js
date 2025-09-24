const Teacher = require("../models/Teacher.model");
const teacherService = require("../services/Teacher.service");
const { validationResult } = require("express-validator");

module.exports.registerTeacher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const teacher = await teacherService.createTeacher({ name, email, password });
    const token = teacher.generateAuthToken();

    res.status(201).json({ token, teacher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.loginTeacher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = teacher.generateAuthToken();

    res.cookie("token", token);
    res.status(200).json({ token, teacher });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports.logoutTeacher = async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Logged out" });
};