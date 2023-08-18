const apiRouter = require('express').Router();
const articleRouter = require('./articles-router.js')
const commentRouter = require('./comments-router.js');
const topicRouter = require('./topics-router');
const userRouter = require('./users-router');
const {getApis} = require('../controllers.js')


apiRouter.use('/articles', articleRouter)
apiRouter.use('/comments', commentRouter)
apiRouter.use('/topics', topicRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/', commentRouter)

apiRouter.get('/', getApis)

module.exports = apiRouter