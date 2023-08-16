const {
    getTopicsData,
    getApiData,
    getArticleData,
    getArticlesData
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
module.exports = {getTopics, getApis, getArticle, getArticles}