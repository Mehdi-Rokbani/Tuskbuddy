const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const userRoutes = require('./routes/userroutes')
const projectRoutes = require('./routes/projectroutes')
const requestroutes = require('./routes/requestroutes')
const teamroutes = require('./routes/teamroutes')
const taskroutes = require('./routes/Taskroutes')
app.use(express.json())

app.use('/users', userRoutes)
app.use('/projects', projectRoutes)
app.use('/requests', requestroutes)
app.use('/teams', teamroutes)
app.use('/tasks', taskroutes)
mongoose.connect(process.env.URL)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('server works')
        })
    })
    .catch((error) => {
        console.log(error)
    })

