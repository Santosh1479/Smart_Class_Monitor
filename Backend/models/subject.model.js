const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  topic: { type: String, required: true }
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: Number, required: true },
  branch: { type: String, required: true }, // Added branch field
  syllabus: [syllabusSchema], // Array of syllabus topics
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;