const express = require('express')
const router = express.Router();
const {
    deleteRequest,
    acceptRequest,
    rejectRequest,
    createRequest,
    getOwnerRequests,
    getFreelancerRequests

} = require('../contollers/requestcontrol')

router.post('/join', createRequest)
router.get('/:ownerId', getOwnerRequests);
router.put('/accept/:requestId', acceptRequest);
router.put('/reject/:requestId', rejectRequest);
router.delete('/:requestId', deleteRequest);
router.get('/freelancer/:userId',  getFreelancerRequests);

module.exports = router