const db = require("./connection.js");
const checkExists = require("./utils.js");
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
  ORDER BY created_at`);

    const articlesArray = articlesComments.rows.reverse();
    articlesArray.forEach((article) => delete article.body);
    return articlesArray;
  } catch (error) {
    throw error;
  }
};
module.exports = { getTopicsData, getApiData, getArticleData, getArticlesData };
