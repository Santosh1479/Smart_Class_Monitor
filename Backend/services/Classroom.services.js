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