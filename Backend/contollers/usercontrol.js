const user = require('../models/User');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose')

// Register a new user
const register = async (req, res) => {
    const { username, email, password, role } = req.body;

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
            return res.status(400).json({ error: 'Password must be at least 8 characters long and contain only letters and numbers.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = await user.create({ username, email, password: hashedPassword, role });

        res.status(201).json({ message: 'User registered successfully.', user: newUser });
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
const updateuser= async (req,res) =>{
    const {id}=req.params

}

//delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Find and delete the user
        const deletedUser = await user.findByIdAndDelete(id);

        // Check if the user exists
        if (!deletedUser) {
            return res.status(404).json({ error: "No user found with this ID." });
        }

        res.status(200).json({ message: "User deleted successfully.", user: deletedUser });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while deleting the user." });
    }
};

module.exports = { register, allUsers, oneUser,deleteUser,updateuser };
