const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/gemini-chat", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

