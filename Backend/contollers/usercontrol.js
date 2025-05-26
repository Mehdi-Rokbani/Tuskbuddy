const user = require('../models/User');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

// login

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '1d' });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic field validation
        if (!email || !password) {
            return res.status(400).json({ error: 'All fields must be filled.' });
        }

        // Check if user exists
        const checkUser = await user.findOne({ email });
        if (!checkUser) {
            return res.status(404).json({ error: 'No user found with this email.' });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, checkUser.password);
        if (!match) {
            return res.status(400).json({ error: 'Email or password is incorrect.' });
        }

        // Create JWT
        const token = createToken(checkUser._id);

        res.status(200).json({
            message: 'Logged in successfully.',
            user: checkUser,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Register a new user
const register = async (req, res) => {
    const { username, email, password, role, skills } = req.body;

    try {
        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // Check if email is already in use
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'This email is already registered.' });
        }

        // Validate password format
        const passwordRegex = /^[a-zA-Z0-9]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long and contain only letters and numbers.' 
            });
        }

        // Validate skills for freelancers
        if (role === 'freelancer') {
            if (!skills || !Array.isArray(skills) || skills.length === 0) {
                return res.status(400).json({ 
                    error: 'Freelancers must select at least one skill.' 
                });
            }
            
            // Validate each skill is from the allowed options
            const allowedSkills = [
                "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
                "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
                "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
                "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
            ];
            
            const invalidSkills = skills.filter(skill => !allowedSkills.includes(skill));
            if (invalidSkills.length > 0) {
                return res.status(400).json({ 
                    error: `Invalid skills selected: ${invalidSkills.join(', ')}` 
                });
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object with conditional skills
        const userData = {
            username,
            email,
            password: hashedPassword,
            role,
            ...(role === 'freelancer' && { skills }) // Only add skills if freelancer
        };

        // Create and save the new user
        const newUser = await user.create(userData);

        // Create token
        const token = createToken(newUser._id);

        // Return response without password
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            ...(newUser.skills && { skills: newUser.skills }) // Only include skills if they exist
        };

        res.status(201).json({ 
            message: 'User registered successfully.', 
            user: userResponse, 
            token 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//get all users
const allUsers = async (req, res) => {
    const users = await user.find({}).sort({ createdAt: -1 })
    res.status(200).json({ message: 'all users', users })
    if (!users) {
        res.status(201).json({ error: 'there is no users' })
    }
}
//get one user
const oneUser = async (req, res) => {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID." });
    }

    try {
        // Fetch user by ID
        const Auser = await user.findById(id);

        // Check if user exists
        if (!Auser) {
            return res.status(404).json({ error: "No user found with this ID." });
        }

        res.status(200).json(Auser);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while retrieving the user." });
    }
};

//update user
const updateuser = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const updatedUser = await user.findByIdAndUpdate(
                id,
                { password: hashedPassword },
                { new: true, runValidators: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json(updatedUser);
        }
        else {
            const updatedUser = await user.findByIdAndUpdate(
                id,
                { ...req.body },
                { new: true, runValidators: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json(updatedUser);
        }


    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};


//delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Validate the ID format first (assuming MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID format." });
    }

    try {
        // Find and delete the user
        const deletedUser = await user.findByIdAndDelete(id);

        // Check if the user exists
        if (!deletedUser) {
            return res.status(404).json({ error: "No user found with this ID." });
        }

        // Optionally: Clean up any related data (sessions, tokens, etc.)
        // Example: await Session.deleteMany({ userId: id });

        return res.status(200).json({
            success: true,
            message: "User deleted successfully.",
            data: {
                userId: deletedUser._id,
                email: deletedUser.email // or other non-sensitive info
            }
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            error: "An error occurred while deleting the user.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { register, allUsers, oneUser, deleteUser, updateuser, login };
