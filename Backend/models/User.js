const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["freelancer", "client"], required: true },

    // Champs spécifiques pour les freelancers
    skills: { type: [String], default: [] },

    // Références aux tâches (Freelancer = tâches assignées, Client = tâches créées)
    assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // Pour les freelancers
    createdTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // Pour les clients

    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema, "User");

module.exports = User;
