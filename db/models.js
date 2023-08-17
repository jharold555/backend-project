const db = require("./connection.js");
const {checkExists, patchVotes, deleteItem}= require("./utils.js");
const fsPromises = require("fs").promises;

const getApiData = async () => {
  const data = await fsPromises.readFile(
    "/home/jasmine/be-nc-news/endpoints.json",
    "utf-8"
  );
  const apis = JSON.parse(data);
  return apis;
};

const getTopicsData = async () => {
  const topics = await db.query("SELECT * FROM topics");
  return topics.rows;
};

const getArticleData = async (id) => {
  const article = await checkExists("articles", "article_id", id);
  return article.rows[0];
};
const getArticlesData = async () => {
  try {
    const articlesComments = await db.query(`SELECT articles.*, 
  COUNT(comment_id) 
  AS comment_count FROM articles 
  LEFT JOIN comments ON comments.article_id = articles.article_id 
  GROUP BY articles.article_id
  ORDER BY created_at DESC`);

    const articlesArray = articlesComments.rows
    articlesArray.forEach((article) => delete article.body);
    return articlesArray;
  } catch (error) {
    throw error;
  }
};
getCommentsData = async (id) => {
  await checkExists("articles", "article_id", id);
  const comments = await db.query(
    "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
    [id]
  );
  const commentsArray = comments.rows;
  if (commentsArray.length === 0) {
    return Promise.reject({
      status: 404,
      msg: `404 comments Not Found`,
    });
  }
  return commentsArray
};
const insertComment = async (body, id) => {
  try{
  const user = body.username;
  await checkExists("articles", "article_id", id);
  await checkExists("users", "username", user);
  const comment = {
    article_id: id,
    author: user,
    votes: 0,
    body: body.body,
    created_at: new Date(),
  };
  const vals = Object.values(comment);
  const commentQ =  await db.query(
    `INSERT INTO comments (article_id, author, votes, body, created_at) 
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;`,
    vals
  );
  return commentQ.rows
}
catch(error){
  if(error.msg.includes('Not Found')){
    return Promise.reject({status: 400, msg: '400 Bad Request'})
  }
  throw error
}
};
const changeArticleVotes = async (obj, id) => {
  await checkExists("articles", "article_id", id);
  await patchVotes("articles", "article_id", obj, id);
  const article = await checkExists("articles", "article_id", id);
  return article.rows[0];
};
const commentDelete = async (id) => {
  await checkExists("comments", "comment_id", id);
  await deleteItem("comments", "comment_id", id);
};

module.exports = { getTopicsData, getApiData, getArticleData, getArticlesData, getCommentsData, insertComment, changeArticleVotes, commentDelete };
