const express = require('express');
const router = express.Router();
const {
    getTeamsByUserId,
    removeMemberFromTeam,
    getProjectsByMemberId
} = require('../contollers/teamcontrol');

// Remove a member from a team
router.put('/remove/:teamId', removeMemberFromTeam);

// Get all projects for a member
router.get('/projects/:memberId', getProjectsByMemberId);
router.get('/find/:id',getTeamsByUserId)

module.exports = router;
