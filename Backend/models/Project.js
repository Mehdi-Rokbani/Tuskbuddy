const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Le client qui a créé le projet
    nbmembers: { type: Number, required: true },
    currentmembers: { type: Number, default: 0 },
    techused: [{ type: String, required: true }],
    deadline: { type: Date, required: true }, // Date limite du projet
    startDate: { type: Date, required:true}, // Date de début du projet
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null }, // Équipe assignée (null au début)
    status: { type: String, enum: ["pending", "in progress", "completed"], default: "pending" }, // État du projet
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;