const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/Classroom.controller');

// Teacher starts a stream
router.post('/:classroomId/start', classroomController.startStream);

// Student or teacher accesses the stream
router.get('/:classroomId/stream', classroomController.getStream);

// Create a new classroom
router.post('/create', classroomController.createClassroom);

// Fetch classrooms by teacher ID
router.get('/teacher/:teacherId', classroomController.getClassroomsByTeacherId);

// Fetch classrooms by student ID
router.get('/student/:userId', classroomController.getClassroomsByStudentId);

// Add a student to a classroom
router.post('/:classroomId/add-student', classroomController.addStudent);

// Download attendance CSV
router.get('/:classroomId/attendance', classroomController.downloadAttendance);

module.exports = router;