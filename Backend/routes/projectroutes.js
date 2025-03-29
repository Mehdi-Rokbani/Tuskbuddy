const express = require('express')

const { register,
    allUsers,
    oneUser,
    deleteUser,
    updateuser
} = require('../contollers/projectcontrol')

const router = express.Router();

router.post('/add', register)
router.get('/allProjects', allUsers)
router.get('/getProject/:id', oneUser)//search
router.delete('/deleteProject/:id', deleteUser)
router.patch('/updateProject/:id', updateuser)//m5dmthch

module.exports = router