const Team = require('../models/Team');
const Project = require('../models/Project');
const Task=require('../models/Tasks');

const mongoose = require('mongoose')

const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format first
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid team ID format'
            });
        }

        const team = await Team.findById(id)
            .populate('ownerId', 'username email role') // Only include specific fields
            .populate('members', 'username email skills') // Only include specific fields
            .populate('projectId', 'title description deadline'); // Only include specific fields

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });

    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching team',
            error: error.message
        });
    }
};


// Remove member from a team
const removeMemberFromTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { memberId } = req.body;

        // First, find the team to get the projectId
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found.' });
        }

        // Check if the member has any tasks assigned in this project
        const hasTasks = await Task.exists({
            projectId: team.projectId,
            assignedTo: memberId,
            isDeleted: false
        });

        if (hasTasks) {
            return res.status(400).json({
                message: 'Cannot remove member. They have assigned tasks in this project.'
            });
        }

        // Start a transaction to ensure both operations succeed or fail together
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Remove member from team
            const updatedTeam = await Team.findByIdAndUpdate(
                teamId,
                { $pull: { members: memberId } },
                { new: true, session }
            );

            // Decrement currentmembers count in the project
            await Project.findByIdAndUpdate(
                team.projectId,
                { $inc: { currentmembers: -1 } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(200).json(updatedTeam);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error; // This will be caught by the outer catch block
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing member.', error: error.message });
    }
};

// ✅ Get all projects by member ID
const getProjectsByMemberId = async (req, res) => {
    try {
        const { memberId } = req.params;

        const teams = await Team.find({ members: memberId }).populate('projectId');

        const projects = teams.map(team => team.projectId);

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects by member.', error: error.message });
    }
};
const getTeamsByUserId = async (req, res) => {
    const { id } = req.params;

    try {
        const teams = await Team.find({
            $or: [
                { ownerId: id },
                { members: id }
            ]
        })
            .populate('projectId')  // optional: populate project details
            .populate('ownerId')    // optional: populate owner details
            .populate('members')


        if (!teams || teams.length === 0) {
            return res.status(404).json({ message: 'No teams found for this user.' });
        }

        res.status(200).json(teams);
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ message: 'Server error while retrieving teams.' });
    }
};
const getTeamsByPoject = async (req, res) => {
    const { id } = req.params;

    try {
        const teams = await Team.find({ projectId: id })
            .populate('projectId')  // optional: populate project details
            .populate('ownerId')    // optional: populate owner details
            .populate('members');   // optional: populate member details

        if (!teams || teams.length === 0) {
            return res.status(404).json({ message: 'No teams found for this project.' });
        }

        res.status(200).json(teams);
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ message: 'Server error while retrieving teams.' });
    }
};
const getAllMembers = async (req, res) => {
    const { teamId } = req.params;

    // Validate teamId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid team ID format'
        });
    }

    try {
        const team = await Team.findById(teamId)
            .populate({
                path: 'ownerId',
                select: 'username email skills role profileImage',
                options: { retainNullValues: true }
            })
            .populate({
                path: 'members',
                select: 'username email skills role profileImage',
                options: { retainNullValues: true }
            })
            .lean();

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Process members - combine owner and members, remove duplicates and nulls
        const membersMap = new Map();

        // Add owner if exists
        if (team.ownerId) {
            membersMap.set(team.ownerId._id.toString(), team.ownerId);
        }

        // Add other members
        team.members.filter(member => member).forEach(member => {
            membersMap.set(member._id.toString(), member);
        });

        const allMembers = Array.from(membersMap.values());

        return res.status(200).json({
            success: true,
            count: allMembers.length,
            data: allMembers,
            includesOwner: !!team.ownerId,
            retrievedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching team members:`, error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching team members',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getTeamsByUserId,
    removeMemberFromTeam,
    getProjectsByMemberId,
    getTeamById,
    getTeamsByPoject,getAllMembers
};
