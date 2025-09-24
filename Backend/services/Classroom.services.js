const Classroom = require("../models/Classroom.model");
const User = require("../models/User.model"); // Assuming you have a User model for students and teachers

// Create a new classroom
exports.createClassroom = async ({ name, subject, teacherId, students = [] }) => {
  try {
    const classroom = new Classroom({
      name,
      subject,
      teacher: teacherId,
      students,
    });
    await classroom.save();
    return classroom;
  } catch (err) {
    console.error("Error creating classroom:", err);
    throw new Error("Failed to create classroom");
  }
};

// Get classrooms by teacher ID
exports.getClassroomsByTeacherId = async (teacherId) => {
  try {
    const classrooms = await Classroom.find({ teacher: teacherId }).populate("students teacher");
    return classrooms;
  } catch (err) {
    console.error("Error fetching classrooms by teacher ID:", err);
    throw new Error("Failed to fetch classrooms");
  }
};

// Get classrooms by student ID
exports.getClassroomsByStudentId = async (studentId) => {
  try {
    const classrooms = await Classroom.find({ students: studentId }).populate("teacher");
    return classrooms;
  } catch (err) {
    console.error("Error fetching classrooms by student ID:", err);
    throw new Error("Failed to fetch classrooms");
  }
};

// Start a stream for a classroom
exports.startStream = async (classroomId, streamUrl) => {
  try {
    const classroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { streamUrl },
      { new: true }
    );
    if (!classroom) {
      throw new Error("Classroom not found");
    }
    return classroom;
  } catch (err) {
    console.error("Error starting stream:", err);
    throw new Error("Failed to start stream");
  }
};

// Add a student to a classroom
exports.addStudent = async (classroomId, studentId) => {
  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Check if the student is already in the classroom
    if (classroom.students.includes(studentId)) {
      throw new Error("Student is already in the classroom");
    }

    classroom.students.push(studentId);
    await classroom.save();
    return classroom;
  } catch (err) {
    console.error("Error adding student to classroom:", err);
    throw new Error("Failed to add student to classroom");
  }
};

// Get attendance CSV for a classroom
exports.getAttendanceCSV = async (classroomId) => {
  const classroom = await Classroom.findById(classroomId).lean();
  if (!classroom) throw new Error("Classroom not found");

  const students = await User.find({ _id: { $in: classroom.students } }).lean();

  const attendance = students.map(student => ({
    name: student.name,
    credits: classroom.credits?.[student._id.toString()] ?? 0,
  }));

  // Sort by name ascending
  attendance.sort((a, b) => a.name.localeCompare(b.name));

  // CSV header
  let csv = "Name,Credits\n";
  csv += attendance.map(a => `${a.name},${a.credits}`).join("\n");

  return csv;
};