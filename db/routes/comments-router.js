const commentRouter = require('express').Router()
const {getArticleComments, deleteComment, patchComment} = require('../controllers.js')

commentRouter.get("/:article_id/comments", getArticleComments);
commentRouter.delete('/:comment_id', deleteComment)
commentRouter.patch('/:comment_id', patchComment)

module.exports = commentRouter