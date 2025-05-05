const express = require('express');
const router = express.Router();
const {
    
    removeMemberFromTeam,
    getProjectsByMemberId
} = require('../contollers/teamcontrol');

// Remove a member from a team
router.put('/remove/:teamId', removeMemberFromTeam);

// Get all projects for a member
router.get('/projects/:memberId', getProjectsByMemberId);

module.exports = router;
