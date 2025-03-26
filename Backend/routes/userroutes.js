const express = require('express')

const { register,
    allUsers,
    oneUser,
    deleteUser,
    updateuser
} = require('../contollers/usercontrol')

const router = express.Router();

router.post('/register', register)
router.get('/allusers', allUsers)
router.get('/Getuser/:id', oneUser)//search
router.delete('/DeleteUser/:id', deleteUser)
router.patch('/UpdateUser/:id', updateuser)//m5dmthch

module.exports = router