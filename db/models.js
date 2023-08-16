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

module.exports = { getTopicsData, getApiData, getArticleData };
