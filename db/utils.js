const format = require("pg-format");
const db = require("./connection.js");

const checkExists = async (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  try {
    const dbOutput = await db.query(queryStr, [value]);

    if (dbOutput.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `404 ${column} of ${value} Not Found`,
      });
    }

    return dbOutput;
  } catch (error) {
    if (error.message.includes("invalid input syntax")) {
      return Promise.reject({ status: 400, msg: "400 Bad Request" });
    }

    throw error;
  }
};

module.exports = checkExists;
