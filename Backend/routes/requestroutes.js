const express = require('express')
const router = express.Router();
const {
    deleteRequest,
    acceptRequest,
    rejectRequest,
    createRequest,
    getOwnerRequests

} = require('../contollers/requestcontrol')

router.post('/join', createRequest)
router.get('/:ownerId', getOwnerRequests);
router.put('/accept/:requestId', acceptRequest);
router.put('/reject/:requestId', rejectRequest);
router.delete('/:requestId', deleteRequest);

module.exports = router