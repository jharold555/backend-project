const articleRouter = require('express').Router()
const {getArticle, getArticles, postComment, patchArticle} = require('../controllers.js')

articleRouter.get('/:article_id', getArticle)
articleRouter.get("/", getArticles);
articleRouter.post("/:article_id/comments", postComment);
articleRouter.patch("/:article_id", patchArticle);

module.exports = articleRouter