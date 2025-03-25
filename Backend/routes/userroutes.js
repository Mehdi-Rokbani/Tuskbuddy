const express=require('express')

const router=express.Router();

router.post('/register')
router.get('/allusers')
router.get('/Getuser:id')//search
router.delete('/DeleteUser:id')
router.patch('/UpdateUser:id')

module.exports=router