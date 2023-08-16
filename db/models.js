const db = require("./connection.js");
const express = require("express");
const checkExists = require('./utils.js')
const fsPromises = require("fs").promises;

const getApiData = () => {
  return fsPromises
    .readFile("/home/jasmine/be-nc-news/endpoints.json", "utf-8")
    .then((data) => {
      const apis = JSON.parse(data);
      return apis;
    });
};
const getTopicsData = () => {
  return db.query("SELECT * FROM topics").then((topics) => {
    return topics.rows;
  });
};
const getArticleData = async (id) => {
  const article = await checkExists('articles', 'article_id', id);
  return article.rows[0]
};
const getArticlesData = async () => {
  const articles = await db.query(
    "SELECT * FROM articles ORDER BY created_at;"
  );
  const comments = await db.query("SELECT * FROM comments;");

  const commentCount = {};
  comments.rows.forEach((comment) => {
    if (!commentCount.hasOwnProperty(comment.article_id)) {
      commentCount[comment.article_id] = 1;
    } else {
      commentCount[comment.article_id]++;
    }
  });
  articles.rows.forEach((article) => {
    delete article.body;
    id = article.article_id;
    if (!commentCount.hasOwnProperty([id])) {
      article.comment_count = 0;
    } else {
      article.comment_count = commentCount[id];
    }
  });

  return articles.rows.reverse();
};
module.exports = { getTopicsData, getApiData, getArticleData, getArticlesData };
