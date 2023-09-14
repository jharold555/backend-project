const express = require('express')
const app = express();
const apiRouter = require('./routes/api-router');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    }
    else next(err)
})
app.use((req, res, next) => {
    res.status(400).send({msg: '400 Bad Request'})
    
})
app.use((err, req, res, next) => {
    if(err.code === '42703' || '22P02'){
    res.status(400).send({msg: '400 Bad Request'})   
    }
    else next(err)
})
app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send("server error")
    })
module.exports = app

