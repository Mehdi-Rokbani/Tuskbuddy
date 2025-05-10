const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: {
        type: String,
        enum: ["pending", "in progress", "completed"],
        default: "pending"
    },
    githubUrl: { type: String }, // Added GitHub URL field
    verified: {
        status: { type: Boolean, default: null }, // true for approved, false for rejected, null for not verified
        verifiedAt: { type: Date }
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", taskSchema);