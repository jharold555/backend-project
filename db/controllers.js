const {
    getTopicsData,
    getApiData,
    getArticleData,
    getArticlesData,
    getCommentsData,
    insertComment,
    changeArticleVotes
}                    = require('./models')

const getApis = (req, res, next) => {
    getApiData().then((apis) => {
        res.status(200).send({apis})
    }).catch(next)
}
const getTopics = (req, res, next) => {
    getTopicsData().then((topics) => {
        res.status(200).send({topics})
        }).catch(next);
} 
const getArticle = (req, res, next) => {
   const id = req.params.article_id
    getArticleData(id).then(article => {
      res.status(200).send({article})
  }).catch(next);
    
}
const getArticles = (req, res, next) => {
    getArticlesData().then(articles => {
        res.status(200).send({articles})
    }).catch(next)
}
const getArticleComments = (req, res, next) => {
    const id = req.params.article_id
    getCommentsData(id).then(comments => {
        res.status(200).send({comments})
    }).catch(next)
}
const postComment = (req, res, next) => {
    const id = req.params.article_id
    const newComment = req.body
    insertComment(newComment, id).then((comment) => {
        res.status(201).send(comment[0])
    }).catch(next)
}
const patchArticle = (req, res, next) => {
    const id = req.params.article_id
    const obj = req.body
    changeArticleVotes(obj, id).then((article) => {
        res.status(200).send({article})
    }).catch(next)
}
module.exports = {getTopics, getApis, getArticle, getArticles, getArticleComments, postComment, patchArticle}