const express = require('express')
const app = express();
const {getTopics} = require('./controllers.js')

app.get('/api/topics', getTopics)

app.use((req, res, next) => {
    res.status(404).send({msg: 'Bad route'})
})


module.exports = app