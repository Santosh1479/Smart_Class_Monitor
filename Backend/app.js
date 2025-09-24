const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const classroomRoutes = require("./routes/Classroom.routes");
const teacherRoutes = require("./routes/Teacher.routes");
const studyRoutes = require("./routes/subject.routes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/classrooms", classroomRoutes);
app.use("/teachers", teacherRoutes);
app.use("/study",studyRoutes)

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;