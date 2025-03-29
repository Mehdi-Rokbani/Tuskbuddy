const project = require('../models/Project');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose')


// Create a new project
const register = async (req, res) => {
    const { title, description, client, deadline } = req.body;
    // Check for missing required fields
    if (!title) {
        return res.status(400).json({ error: "Project title is required." });
    }
    if (!client) {
        return res.status(400).json({ error: "Client ID is required." });
    }
    if (!deadline) {
        return res.status(400).json({ error: "Deadline is required." });
    }
    if (!description) {
        return res.status(400).json({ error: "description is required." });
    }

    try {
        // Validate client ID format
        if (!mongoose.Types.ObjectId.isValid(client)) {
            return res.status(400).json({ error: "Invalid client ID format." });
        }

        // Validate deadline
        const parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ error: "Invalid deadline format. Use YYYY-MM-DD." });
        }
        if (parsedDeadline < new Date()) {
            return res.status(400).json({ error: "Deadline must be a future date." });
        }

        // Create a new project
        const newProject = await project.create({
            title,
            description: description || "", // Default to empty string if undefined
            client,
            deadline: parsedDeadline
        });

        res.status(201).json({ message: "Project created successfully.", project: newProject });
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
    const { id } = req.params

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

module.exports = { register, allUsers, oneUser, deleteUser, updateuser };
