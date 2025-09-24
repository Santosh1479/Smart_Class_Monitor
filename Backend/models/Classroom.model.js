const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  credits: {
    type: Map,
    of: Number,
    default: {},
  },
  streamUrl: { type: String, default: null },
});

module.exports = mongoose.model("Classroom", ClassroomSchema);
