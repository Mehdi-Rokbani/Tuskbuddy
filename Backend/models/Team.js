// models/Team.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const teamSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
