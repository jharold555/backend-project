const db = require("./connection.js");
const { checkExists, patchVotes, deleteItem } = require("./utils.js");
const fsPromises = require("fs").promises;
const format = require("pg-format");

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
  await checkExists("articles", "article_id", id);
  let queryStr = format(`SELECT articles.*, 
   COUNT(comment_id) 
   AS comment_count FROM articles 
   LEFT JOIN comments ON comments.article_id = articles.article_id 
   WHERE articles.article_id = $1
   GROUP BY articles.article_id`);
  const article = await db.query(queryStr, [id]);
  return article.rows[0];
};
const getArticlesData = async (
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1,
  topic
) => {
  const offset = (p - 1) * limit;
  let values = [limit, offset];
  const validOrder = ["asc", "desc"];

  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "400 Bad Request" });
  }
  try {
    let column = sort_by;
    let queryStr1 = format(
      `SELECT 
      articles.article_id,
      articles.title,
      articles.topic,
      articles.author,
      articles.created_at,
      articles.votes,
      articles.article_img_url, 
    COUNT(comment_id) 
    AS comment_count FROM articles 
    LEFT JOIN comments ON comments.article_id = articles.article_id`
    );

    let queryStr2 = format(
      ` GROUP BY articles.article_id
    ORDER BY %I`,
      column
    );
    order === "asc" ? (queryStr2 += ` ASC`) : (queryStr2 += ` DESC`);
    let queryStr3 = format(` LIMIT $1 
    OFFSET $2`);

    if (topic) {
      await checkExists("articles", "topic", topic);
      const topicStr = format(` WHERE topic = $1 `);
      let queryStr3 = format(` LIMIT $2 
    OFFSET $3`);
      values.unshift(topic);
      const articlesQuery = await db.query(
        queryStr1 + topicStr + queryStr2 + queryStr3,
        values
      );
      const total = await db.query(
        "SELECT COUNT(*) AS total_count FROM articles WHERE topic = $1",
        [topic]
      );
      const articles = articlesQuery.rows;
      const { total_count } = total.rows[0];
      const responseObj = { articles, total_count };
      return responseObj;
    }

    const articlesQuery = await db.query(
      queryStr1 + queryStr2 + queryStr3,
      values
    );
    const total = await db.query(
      "SELECT COUNT(*) AS total_count FROM articles"
    );
    const articles = articlesQuery.rows;
    const { total_count } = total.rows[0];
    const responseObj = { articles, total_count };
    return responseObj;
  } catch (error) {
    throw error;
  }
};
getCommentsData = async (limit = 10, p = 1, id) => {
  const offset = (p - 1) * limit;
  await checkExists("articles", "article_id", id);
  const comments = await db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 
    OFFSET $3;`,
    [id, limit, offset]
  );
  const commentsArray = comments.rows;
  return commentsArray;
};

const insertComment = async (body, id) => {
  try {
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
    const commentQ = await db.query(
      `INSERT INTO comments (article_id, author, votes, body, created_at) 
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;`,
      vals
    );
    return commentQ.rows;
  } catch (error) {
    if (error.msg.includes("Not Found")) {
      return Promise.reject({ status: 400, msg: "400 Bad Request" });
    }
    throw error;
  }
};

const getUsersData = async () => {
  const users = await db.query("SELECT * FROM users");
  return users.rows;
};
const postArticleData = async (obj) => {
  try {
    if (obj.article_img_url === "") {
      obj.article_img_url =
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700";
    }
    const values = [
      obj.author,
      obj.title,
      obj.body,
      obj.topic,
      obj.article_img_url,
      0,
      new Date(),
    ];
    const articleid = await db.query(
      `INSERT INTO articles (author, title, body, topic, article_img_url, votes, created_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING article_id;`,
      values
    );
    const id = articleid.rows[0].article_id;
    return await getArticleData(id);
  } catch (error) {
    throw error;
  }
};
const postTopicData = async (obj) => {
  const values = [obj.slug, obj.description];
  if (values.includes(undefined) || values.includes('')) {
    return Promise.reject({ status: 400, msg: "400 Bad Request" });
  }
  const topic = await db.query(
    `INSERT INTO topics (slug, description)
  VALUES ($1, $2)
  RETURNING *;`,
    values
  );
  return topic.rows[0];
};
module.exports = {
  getTopicsData,
  getApiData,
  getArticleData,
  getArticlesData,
  insertComment,
  getUsersData,
  postArticleData,
  postTopicData,
};
