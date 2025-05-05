const express = require('express')

const { register,
    allProjects,
    oneProject,
    deleteProject,
    updateproject,
    ProjectOwner
} = require('../contollers/projectcontrol')

const router = express.Router();

router.post('/add', register)
router.get('/get/:id', ProjectOwner)
router.get('/allProjects', allProjects)
router.get('/getProject/:id', oneProject)//search
router.delete('/deleteProject/:id', deleteProject)
router.patch('/updateProject/:id', updateproject)//m5dmthch

module.exports = router