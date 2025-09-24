const Teacher = require("../models/Teacher.model");

module.exports.createTeacher = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  const existingTeacher = await Teacher.findOne({ email });
  if (existingTeacher) {
    throw new Error("Teacher already exists");
  }

  const hashedPassword = await Teacher.hashPassword(password);

  const teacher = await Teacher.create({ name, email, password: hashedPassword });
  return teacher;
};