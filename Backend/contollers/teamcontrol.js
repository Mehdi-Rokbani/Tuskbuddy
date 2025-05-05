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

module.exports = {
    removeMemberFromTeam,
    getProjectsByMemberId,
};
