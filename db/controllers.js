
const {
  getTopicsData,
  getApiData,
  getArticleData,
  getArticlesData,
  insertComment,
  getUsersData,
  postArticleData,
  postTopicData,
} = require("./models");
const { checkExists, patchVotes, deleteItem } = require("./utils");

const getApis = (req, res, next) => {
  getApiData()
    .then((apis) => {
      res.status(200).send({ apis });
    })
    .catch(next);
};
const getTopics = (req, res, next) => {
  getTopicsData()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};
const getArticle = (req, res, next) => {
  const id = req.params.article_id;
  checkExists("articles", "article_id", id)
    .then(() => {
      return getArticleData(id);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
const getArticles = (req, res, next) => {
  const topic = req.query.topic;
  const sort_by = req.query.sort_by;
  const order = req.query.order;
  const limit = req.query.limit;
  const p = req.query.p;
  getArticlesData(sort_by, order, limit, p, topic)
    .then((responseObj) => {
      if (responseObj.articles.length === 0) {
        res.status(404).send({ msg: "404 articles Not Found" });
      }
      res.status(200).send(responseObj);
    })
    .catch(next);
};
const getArticleComments = (req, res, next) => {
  const id = req.params.article_id;
  const limit = req.query.limit;
  const p = req.query.p;
  checkExists("articles", "article_id", id)
    .then(() => {
      return getCommentsData(limit, p, id);
    })
    .then((comments) => {
      if (comments.length === 0) {
        res.status(404).send({ msg: "404 comments Not Found" });
      }
      res.status(200).send({ comments });
    })
    .catch(next);
};
const postComment = (req, res, next) => {
  const id = req.params.article_id;
  const newComment = req.body;
  checkExists("articles", "article_id", id)
    .then(() => {
      return insertComment(newComment, id);
    })
    .then((comment) => {
      res.status(201).send(comment[0]);
    })
    .catch(next);
};
const patchArticle = (req, res, next) => {
  const id = req.params.article_id;
  const obj = req.body;
  checkExists("articles", "article_id", id)
    .then(() => {
      return patchVotes("articles", "article_id", obj, id);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
const deleteComment = (req, res, next) => {
  const id = req.params.comment_id;
  checkExists("comments", "comment_id", id)
    .then(() => {
      deleteItem("comments", "comment_id", id);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
const getUsers = (req, res, next) => {
  getUsersData()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};
const getUsername = (req, res, next) => {
  const id = req.params.username;
  checkExists("users", "username", id)
    .then((user) => {
      res.status(200).send(user.rows[0]);
    })
    .catch(next);
};
const patchComment = (req, res, next) => {
  const id = req.params.comment_id;
  const obj = req.body;
  checkExists("comments", "comment_id", id)
    .then(() => {
      return patchVotes("comments", "comment_id", obj, id);
    })
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
const postArticle = (req, res, next) => {
  const obj = req.body;
  postArticleData(obj)
    .then((id) => {
      return getArticleData(id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
const postTopic = (req, res, next) => {
  const obj = req.body;
  postTopicData(obj)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};
const deleteArticle = (req, res, next) => {
  const id = req.params.article_id;
  checkExists("articles", "article_id", id)
    .then(() => {
      deleteItem("comments", "article_id", id);
    })
    .then(() => {
      deleteItem("articles", "article_id", id);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
module.exports = {
  getTopics,
  getApis,
  getArticle,
  getArticles,
  getArticleComments,
  postComment,
  patchArticle,
  deleteComment,
  getUsers,
  getUsername,
  patchComment,
  postArticle,
  postTopic,
  deleteArticle,
};
