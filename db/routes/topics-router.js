const { getTopics } = require("../controllers");
const topicRouter = require("express").Router();

topicRouter.get("/", getTopics);

module.exports = topicRouter;
