const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Generate JWT token
teacherSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: "teacher" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Compare password
teacherSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Hash password
teacherSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

module.exports = mongoose.model("Teacher", teacherSchema);