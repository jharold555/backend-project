const { getTopics, postTopic } = require("../controllers");
const topicRouter = require("express").Router();

topicRouter.get("/", getTopics);
topicRouter.post('/', postTopic)

module.exports = topicRouter;
