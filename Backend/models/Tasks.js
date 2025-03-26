const mongoose = require("mongoose");

// Définition du schéma
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "in progress", "completed"], default: "pending" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Référence vers un utilisateur
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },

});

// Création du modèle
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
