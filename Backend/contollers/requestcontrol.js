// controllers/requestController.js
const project = require('../models/Project.js')
const Request = require('../models/Request');
const Team = require('../models/Team');

const createRequest = async (req, res) => {
    try {
        // Validate content type
        if (!req.is('application/json')) {
            return res.status(415).json({ 
                error: 'Unsupported Media Type', 
                message: 'Content-Type must be application/json' 
            });
        }

        const { projectId, userId, ownerId, skills, about, email } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!projectId) missingFields.push('projectId');
        if (!userId) missingFields.push('userId');
        if (!ownerId) missingFields.push('ownerId');
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: `The following fields are required: ${missingFields.join(', ')}`,
                missingFields
            });
        }

        // Check project existence and capacity
        const project0 = await project.findById(projectId);
        if (!project0) {
            return res.status(404).json({ 
                error: 'Not Found', 
                message: 'Project not found' 
            });
        }

        if (project.nbmembers <= 0) {
            return res.status(403).json({
                error: 'Team Full',
                message: 'This project team has reached maximum capacity',
                capacity: {
                    maxMembers: project.nbmembers,
                    availableSpots: 0
                }
            });
        }

        // Check for existing request
        const existingRequest = await Request.findOne({ 
            projectId, 
            freelancerId:userId 
        });
        
        if (existingRequest) {
            return res.status(409).json({
                error: 'Duplicate Request',
                message: 'You have already sent a request for this project',
                requestStatus: existingRequest.status,
                existingRequestId: existingRequest._id
            });
        }

        // Check existing team membership
        const team = await Team.findOne({ projectId });
        if (team?.members.includes(userId)) {
            return res.status(409).json({
                error: 'Already a Member',
                message: 'You are already a member of this project team',
                teamId: team._id,
                joinedAt: team.createdAt
            });
        }

        // Create new request
        const newRequest = await Request.create({
            projectId,
            freelancerId: userId,
            projectOwnerId: ownerId,
            skills: skills || '',
            about: about || '',
            email: email || '',
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Join request submitted successfully',
            request: newRequest,
            nextSteps: 'The project owner will review your request'
        });

    } catch (error) {
        console.error('Request creation error:', error);

        // Handle specific error types
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                error: 'Validation Failed',
                message: 'Invalid request data',
                details: errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid ID Format',
                message: 'One or more provided IDs are invalid',
                path: error.path,
                value: error.value
            });
        }

        // Generic error handler
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request',
            ...(process.env.NODE_ENV === 'development' && {
                debug: {
                    message: error.message,
                    stack: error.stack
                }
            })
        });
    }
};

// Get all pending requests for a project owner
const getOwnerRequests = async (req, res) => {
    try {
        const { ownerId } = req.params;

        const requests = await Request.find({ projectOwnerId: ownerId, status: 'pending' })
            .populate('freelancerId', 'username email')
            .populate('projectId', 'title');

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests.', error: error.message });
    }
};

// Accept a join request
const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        request.status = 'accepted';
        await request.save();

        if (request.projectId) {
            await project.findByIdAndUpdate(
                request.projectId,
                { $inc: { nbmembers: -1 } }
            );
        }


        let team = await Team.findOne({ projectId: request.projectId });
        if (!team) {
            team = new Team({
                projectId: request.projectId,
                ownerId: request.projectOwnerId,
                members: [request.userId]
            });
        } else {
            if (!team.members.includes(request.userId)) {
                team.members.push(request.userId);
            }
        }
        await team.save();

        res.status(200).json({ message: 'Request accepted and user added to team.' });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting request.', error: error.message });
    }
};

// Reject a join request
const rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        request.status = 'rejected';
        await request.save();

        res.status(200).json({ message: 'Request rejected.' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting request.', error: error.message });
    }
};

// Delete a join request
const deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const deleted = await Request.findByIdAndDelete(requestId);

        if (!deleted) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        res.status(200).json({ message: 'Request deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting request.', error: error.message });
    }
};


const getFreelancerRequests = async (req, res) => {
    try {
        const userId = req.params.userId;

        const requests = await Request.find({ freelancerId: userId })
            .populate('projectId', 'title description')
            .populate('projectOwnerId', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export all at the bottom
module.exports = {
    createRequest,
    getOwnerRequests,
    acceptRequest,
    rejectRequest,
    deleteRequest,
    getFreelancerRequests
};
