const Subject = require("../models/subject.model");

const addSubject = async (req, res) => {
  try {
    const { name, semester, branch, syllabus } = req.body;

    // Create a new subject
    const subject = new Subject({
      name,
      semester,
      branch,
      syllabus,
    });

    // Save to the database
    await subject.save();
    res.status(201).json({ message: "Subject added successfully", subject });
  } catch (error) {
    res.status(500).json({ message: "Error adding subject", error });
  }
};

const getSubjectsBySemesterAndBranch = async (req, res) => {
    try {
      const { semester, branch } = req.params;
  
      // Find subjects matching the semester and branch
      const subjects = await Subject.find({ semester, branch });
  
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subjects", error });
    }
  };
  
  module.exports = { addSubject, getSubjectsBySemesterAndBranch };