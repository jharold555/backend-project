const express = require('express')
const app = express();
const {getTopics, getApis, getArticle, getArticles, getArticleComments, postComment, patchArticle, deleteComment, getUsers} = require('./controllers.js')
app.use(express.json());

app.get('/api', getApis)
app.get('/api/topics', getTopics)
app.get('/api/articles/:article_id', getArticle)
app.get("/api/articles", getArticles);
app.get("/api/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);
app.delete('/api/comments/:comment_id', deleteComment)
app.get('/api/users', getUsers)

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
    console.log(err);
    res.status(500).send("server error")
    })
module.exports = app
