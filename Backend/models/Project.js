const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Le client qui a créé le projet*/
    assignedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Liste des freelancers assignés
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // Tâches liées au projet
    nbmembers: { type: Number, required: true },
    techused: { type: String, required: true },
    deadline: { type: Date, required: true }, // Date limite du projet*/
    status: { type: String, enum: ["pending", "in progress", "completed"], default: "pending" }, // État du projet
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
