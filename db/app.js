const express = require('express')
const app = express();
const {getTopics, getApis, getArticle} = require('./controllers.js')


app.get('/api', getApis)
app.get('/api/topics', getTopics)
app.get('/api/articles/:article_id', getArticle)

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    }
    else next(err)
})
app.use((req, res, next) => {
    
    res.status(400).send({msg: '400 Invalid route'})
    
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send("server error")
    })
module.exports = app