const db = require("./connection.js");
const fs = require("fs");
const fsPromises = require('fs').promises

const getApiData = () => {
     return fsPromises.readFile('/home/jasmine/be-nc-news/endpoints.json', 'utf-8')
     .then((data) => {
        const apis = JSON.parse(data);
      return apis;
     })
}
const getTopicsData = () => {
  return db.query('SELECT * FROM topics').then(topics => {
    return topics.rows;
  })
  
}

module.exports = {getTopicsData, getApiData}