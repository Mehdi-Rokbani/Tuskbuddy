const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const userRoutes = require('./routes/userroutes')
const projectRoutes = require('./routes/projectroutes')
app.use(express.json())

app.use('/users', userRoutes)
app.use('/projects', projectRoutes)

mongoose.connect(process.env.URL)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('server works')
        })
    })
    .catch((error) => {
        console.log(error)
    })

