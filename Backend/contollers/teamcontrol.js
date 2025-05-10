const Team = require('../models/Team');
const Project = require('../models/Project');



// Remove member from a team
const removeMemberFromTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { memberId } = req.body;

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $pull: { members: memberId } },
            { new: true }
        );

        res.status(200).json(updatedTeam);
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
            .populate('members');   // optional: populate member details

        if (!teams || teams.length === 0) {
            return res.status(404).json({ message: 'No teams found for this user.' });
        }

        res.status(200).json(teams);
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ message: 'Server error while retrieving teams.' });
    }
};

module.exports = {
    getTeamsByUserId,
    removeMemberFromTeam,
    getProjectsByMemberId,
};
