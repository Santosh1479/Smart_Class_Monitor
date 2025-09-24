const userModel = require('../models/User.model');
const teacherModel = require('../models/Teacher.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');

// Middleware to authenticate users
module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
// Middleware to authenticate teachers
module.exports.authTeacher = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const teacher = await teacherModel.findById(decoded._id);

        if (!teacher) {
            return res.status(401).json({ message: 'Teacher not found' });
        }

        req.teacher = teacher;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};