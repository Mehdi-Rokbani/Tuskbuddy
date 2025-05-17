const mongoose = require('mongoose');
const { Schema } = mongoose;

const requestSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    freelancerId: {  // Renamed from userId for clarity
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    projectOwnerId: { // Renamed from ownerId to avoid ambiguity
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    skills: {
        type: [String],  // Array of strings (e.g., ["React", "Node.js"])
        required: true,
    },
    about: {
        type: String,
        required: true,
        maxlength: 500,  // Prevent overly long descriptions
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    isDeleted: { type: Boolean, default: false },
    // Optional: Track decision timestamp
    decidedAt: {
        type: Date,
    }
}, { timestamps: true });
module.exports = mongoose.model('Request', requestSchema);