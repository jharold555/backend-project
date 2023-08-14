const express = require('express')
const app = express();
const {getTopics, getApis} = require('./controllers.js')

app.use(express.json());

app.get('/api', getApis)
app.get('/api/topics', getTopics)

app.use((req, res, next) => {
    res.status(404).send({msg: 'Bad route'})
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send("server error")
    })
module.exports = app