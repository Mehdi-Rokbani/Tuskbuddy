const Task = require("../models/Tasks");
const User = require("../models/User");
const Project = require("../models/Project"); // import Project model


// Add to existing controller functions

// Update createTask to accept githubUrl
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            assignedTo,
            createdBy,
            projectId,
            githubUrl    // ← new field
        } = req.body;

        // required fields
        if (!title || !createdBy || !projectId) {
            return res.status(400).json({
                message: "title, createdBy, and projectId are required"
            });
        }

        // validate creator
        const creator = await User.findById(createdBy);
        if (!creator) {
            return res.status(404).json({ message: "Creator not found" });
        }

        // validate project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // validate assignee (if any)
        if (assignedTo) {
            const user = await User.findById(assignedTo);
            if (!user) {
                return res.status(404).json({ message: "Assigned user not found" });
            }
        }

        // build & save
        const newTask = new Task({
            title,
            description,
            status: status || "pending",
            assignedTo,
            createdBy,
            projectId,
            githubUrl,           // ← include it
            createdAt: new Date()
        });

        const savedTask = await newTask.save();

        // populate for response
        const populatedTask = await Task.findById(savedTask._id)
            .populate("assignedTo", "username email")
            .populate("createdBy", "username email")
            .populate("projectId", "name");

        return res.status(201).json({
            success: true,
            data: populatedTask,
            message: "Task created successfully"
        });

    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({
            message: "Server error while creating task",
            error: error.message
        });
    }
};

// Add new function to update GitHub URL
const updateTaskGithubUrl = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { githubUrl } = req.body;

        if (!githubUrl) {
            return res.status(400).json({
                message: "GitHub URL is required"
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { githubUrl },
            { new: true }
        ).populate("assignedTo", "username email")
            .populate("createdBy", "username email");

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            success: true,
            data: updatedTask,
            message: "GitHub URL updated successfully"
        });

    } catch (error) {
        console.error("Error updating GitHub URL:", error);
        res.status(500).json({
            message: "Server error while updating task",
            error: error.message
        });
    }
};

// Add new function for verification
const verifyTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { verified } = req.body;

        if (verified !== true && verified !== false) {
            return res.status(400).json({
                message: "Verification status must be true (approved) or false (rejected)"
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                verified: {
                    status: verified,
                    verifiedAt: new Date()
                }
            },
            { new: true }
        ).populate("assignedTo", "username email")
            .populate("createdBy", "username email");

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            success: true,
            data: updatedTask,
            message: verified ? "Task approved successfully" : "Task rejected"
        });

    } catch (error) {
        console.error("Error verifying task:", error);
        res.status(500).json({
            message: "Server error while verifying task",
            error: error.message
        });
    }
};



const getUserTasks = async (req, res) => {
    try {
        const { userId } = req.params;

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const tasks = await Task.find({ assignedTo: userId })
            .populate("createdBy", "username email")
            .populate("projectId", "title description") // Added population for project data
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });

    } catch (error) {
        console.error("Error fetching user tasks:", error);
        res.status(500).json({
            message: "Server error while fetching tasks",
            error: error.message
        });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (!status || !["pending", "in progress", "completed"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'pending', 'in progress', or 'completed'"
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        ).populate("assignedTo", "username email")
            .populate("createdBy", "username email");

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            success: true,
            data: updatedTask,
            message: "Task status updated successfully"
        });

    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({
            message: "Server error while updating task",
            error: error.message
        });
    }
};

// Update module.exports
module.exports = {
    createTask,
    getUserTasks,
    updateTaskStatus,
    updateTaskGithubUrl, // Add new function
    verifyTask           // Add new function
};
