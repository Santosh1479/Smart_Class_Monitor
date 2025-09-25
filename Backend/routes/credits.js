const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

router.post("/save-credits", (req, res) => {
  const { filename, data } = req.body;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Credits");

  const savePath = path.join(__dirname, "../credits", filename);
  XLSX.writeFile(wb, savePath);

  res.status(200).send("Credits file saved.");
});

module.exports = router;