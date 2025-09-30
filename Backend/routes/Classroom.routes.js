const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/Classroom.controller');

// Create a new classroom
router.post('/create', classroomController.createClassroom);

// Fetch classrooms by teacher ID
router.get('/teacher/:teacherId', classroomController.getClassroomsByTeacherId);

// Download attendance CSV
router.get('/:classroomId/attendance', classroomController.downloadAttendance);

module.exports = router;