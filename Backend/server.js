const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const userRoutes = require('./routes/userroutes')
app.use(express.json())

app.use('/users', userRoutes)

mongoose.connect(process.env.URL)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('server works')
        })
    })
    .catch((error) => {
        console.log(error)
    })

