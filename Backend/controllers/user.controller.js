const userModel = require('../models/User.model');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blackListToken.model');
const bcrypt = require('bcrypt');


module.exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, usn, branch, semester } = req.body;

        if (!name || !email || !password || !usn || !branch || !semester) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await userModel.hashPassword(password);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword, // Save the hashed password
            usn,
            branch,
            semester,
        });

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "User registered successfully", token, user });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports.loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare the password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error("Error in loginuser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.getUserData = async (req, res) => {
    try {
        const user = req.user; // Assuming `authUser` middleware attaches the user to `req`
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user data" });
    }
};

module.exports.logoutUser = async (req, res, next) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blacklistTokenModel.create({ token });

    res.status(200).json({ message: "logged out" });
}