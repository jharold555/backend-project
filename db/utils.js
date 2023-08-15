const format = require('pg-format')
const db = require("./connection.js");

const checkExists = async (table, column, value) => {
    
    const queryStr = format('SELECT * FROM %I WHERE %I = $1;', table, column);
    const dbOutput = await db.query(queryStr, [value]);
  
    if (dbOutput.rows.length === 0) {
      return Promise.reject({ status: 400, msg: `400 Bad Request, ${column} of ${value} not found` });
    }
    else return dbOutput
  };
module.exports = checkExists