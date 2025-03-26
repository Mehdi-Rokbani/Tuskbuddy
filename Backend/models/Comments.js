const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    taskid: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true }, // Task associée
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Auteur du commentaire
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
