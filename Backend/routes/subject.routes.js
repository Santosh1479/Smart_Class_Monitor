const express = require("express");
const { addSubject, getSubjectsBySemesterAndBranch } = require("../controllers/subject.controller");

const router = express.Router();

// Route to add a subject
router.post("/add-subject", addSubject);

// Route to get subjects by semester and branch
router.get("/subjects/:semester/:branch", getSubjectsBySemesterAndBranch);

module.exports = router;