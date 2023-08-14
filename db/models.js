const db = require("./connection.js");

const getTopicsData = () => {
  return db.query('SELECT * FROM topics').then(topics => {
    return topics.rows;
  })
  
}

module.exports = {getTopicsData}