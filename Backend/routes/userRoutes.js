// filepath: c:\Users\Santosh\Desktop\CBC_F-05\Backend\routes\userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const userController = require('../controllers/user.controller');
const { authUser } = require('../middleware/authMiddleware');

// Example route to get user data (protected route)
router.get('/data', authUser, userController.getUserData);

// Example route for user registration
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    userController.registerUser
);

// Example route for user login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    userController.loginuser
);

module.exports = router;