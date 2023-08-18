const commentRouter = require('express').Router()
const {getArticleComments, deleteComment} = require('../controllers.js')

commentRouter.get("/:article_id/comments", getArticleComments);
commentRouter.delete('/:comment_id', deleteComment)

module.exports = commentRouter