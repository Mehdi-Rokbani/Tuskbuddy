const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
    content: { type: String, required: true },
    id: { type: String, required: true, unique: true },
});

notificationSchema.methods.send = function (message) {
    console.log(`Notification sent: ${message}`);
};

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
