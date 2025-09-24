const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const tempDir = path.join(__dirname, "../temp");

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

router.post("/upload", (req, res) => {
  const chunk = req.files.chunk; // Assuming you're using multer for file uploads
  const filePath = path.join(tempDir, `${Date.now()}.webm`);
  fs.writeFileSync(filePath, chunk.data);
  res.status(200).send("Chunk received");
});

module.exports = router;