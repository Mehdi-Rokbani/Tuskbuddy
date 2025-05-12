// controllers/requestController.js
const project = require('../models/Project.js')
const Request = require('../models/Request');
const Team = require('../models/Team');

// Create a new join request
const createRequest = async (req, res) => {
    try {
        const { projectId, userId, ownerId, skills, about, email } = req.body;

        // Check if a request already exists
        const existingRequest = await Request.findOne({ projectId, userId });

        if (existingRequest) {
            return res.status(400).json({ message: 'You have already sent a request for this project.' });
        }

        // No existing request, create a new one
        const newRequest = new Request({
            projectId,
            userId,
            ownerId,
            skills,
            about,
            email
        });

        await newRequest.save();
        res.status(201).json({ message: 'Join request sent successfully.', request: newRequest });

    } catch (error) {
        res.status(500).json({ message: 'Error creating request.', error: error.message });
    }
};


// Get all pending requests for a project owner
const getOwnerRequests = async (req, res) => {
    try {
        const { ownerId } = req.params;

        const requests = await Request.find({ ownerId, status: 'pending' })
            .populate('userId', 'email')
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
                ownerId: request.ownerId,
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

        const requests = await Request.find({ userId })
            .populate('projectId', 'title description')
            .populate('ownerId', 'username email')
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
