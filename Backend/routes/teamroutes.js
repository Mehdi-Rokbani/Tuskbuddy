const express = require('express');
const router = express.Router();
const {
    getTeamsByUserId,
    removeMemberFromTeam,
    getProjectsByMemberId,
    getTeamById,
    getTeamsByPoject,getAllMembers
} = require('../contollers/teamcontrol');

// Remove a member from a team
router.put('/remove/:teamId', removeMemberFromTeam);
router.get('/:id',getTeamById);

// Get all projects for a member
router.get('/projects/:memberId', getProjectsByMemberId);
router.get('/find/:id',getTeamsByUserId);
router.get('/findt/:id',getTeamsByPoject)
router.get('/members/:teamId',getAllMembers)

module.exports = router;
