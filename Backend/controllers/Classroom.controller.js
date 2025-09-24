const classroomService = require('../services/Classroom.services');
const Classroom = require('../models/Classroom.model');
const User = require('../models/User.model'); // Assuming you have a User model

// Create a new classroom
exports.createClassroom = async (req, res) => {
  const { name, subject, students, teacherId } = req.body;

  if (!name || !subject || !teacherId) {
    return res.status(400).json({ message: "Classroom name, subject, and teacher ID are required" });
  }

  try {
    const classroom = await classroomService.createClassroom({ name, subject, teacherId, students });
    res.status(201).json(classroom);
  } catch (err) {
    console.error("Error creating classroom:", err);
    res.status(500).json({ message: "Failed to create classroom" });
  }
};

// Get classrooms by teacher ID
exports.getClassroomsByTeacherId = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const classrooms = await classroomService.getClassroomsByTeacherId(teacherId);
    res.status(200).json(classrooms);
  } catch (err) {
    console.error("Error fetching classrooms:", err);
    res.status(500).json({ message: "Failed to fetch classrooms" });
  }
};

// Get classrooms by student ID
exports.getClassroomsByStudentId = async (req, res) => {
  const { userId } = req.params;

  try {
    const classrooms = await classroomService.getClassroomsByStudentId(userId);
    res.status(200).json(classrooms);
  } catch (err) {
    console.error("Error fetching classrooms:", err);
    res.status(500).json({ message: "Failed to fetch classrooms" });
  }
};

// Start a stream for a classroom
exports.startStream = async (req, res) => {
  const { classroomId } = req.params;
  const { streamUrl } = req.body;

  try {
    const classroom = await classroomService.startStream(classroomId, streamUrl);
    res.status(200).json({ message: "Stream started successfully", classroom });
  } catch (err) {
    console.error("Error starting stream:", err);
    res.status(500).json({ message: "Failed to start stream" });
  }
};

// Get the stream for a classroom
exports.getStream = async (req, res) => {
  const { classroomId } = req.params;

  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom || !classroom.streamUrl) {
      return res.status(404).json({ message: "Stream not found or not live" });
    }

    res.status(200).json({ streamUrl: classroom.streamUrl });
  } catch (err) {
    console.error("Error fetching stream:", err);
    res.status(500).json({ message: "Failed to fetch stream" });
  }
};

// Add a student to a classroom
exports.addStudent = async (req, res) => {
  const { classroomId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Student email is required" });
  }

  try {
    const student = await User.findOne({ email});
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if the student is already in the classroom
    if (classroom.students.includes(student._id)) {
      return res.status(400).json({ message: "Student is already in the classroom" });
    }

    classroom.students.push(student._id);
    await classroom.save();

    res.status(200).json({ message: "Student added successfully", classroom });
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ message: "Failed to add student to classroom" });
  }
};

// Download attendance for a classroom
exports.downloadAttendance = async (req, res) => {
  const { classroomId } = req.params;
  try {
    const classroom = await Classroom.findById(classroomId).lean();
    if (!classroom) return res.status(404).send("Classroom not found");

    // Get all students' info
    const students = await User.find({ _id: { $in: classroom.students } }).lean();

    // Prepare attendance array
    const attendance = students.map(student => ({
      name: student.name,
      credits: classroom.credits?.[student._id.toString()] ?? 0,
    }));

    // Sort by name ascending
    attendance.sort((a, b) => a.name.localeCompare(b.name));

    // CSV header
    let csv = "Name,Credits\n";
    csv += attendance.map(a =>
      `"${(a.name || "").replace(/"/g, '""')}",${a.credits}`
    ).join("\n");

    // Generate end time string: YYYY-MM-DD_HH-mm
    const now = new Date();
    const pad = n => n.toString().padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${classroom.name}_${dateStr}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).send("Error generating attendance");
  }
};