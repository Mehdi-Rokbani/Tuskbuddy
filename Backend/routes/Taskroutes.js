const express = require("express");
const router = express.Router();
const {
    createTask,
    getUserTasks,
    updateTaskStatus,
    updateTaskGithubUrl, // Add new controller functions
    verifyTask,
    getTasksByUserAndProject
} = require("../contollers/Taskcontroler");

// Create a new task
router.post("/tasks", createTask);

// Get tasks assigned to a user
router.get("/user/:userId", getUserTasks);

// Update task status
router.patch("/:taskId/status", updateTaskStatus);

// Add new routes
// Update GitHub URL
router.patch("/:taskId/github-url", updateTaskGithubUrl);

// Verify task (approve/reject)
router.patch("/:taskId/verify", verifyTask);

router.get('/user/:userId/project/:projectId',getTasksByUserAndProject);

module.exports = router;