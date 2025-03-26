const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "moderator"], default: "moderator" }, // Différents niveaux d'admin

    permissions: {
        type: [String],
        default: ["manage_users", "manage_tasks", "view_reports"]
    }, // Liste des permissions

    createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
