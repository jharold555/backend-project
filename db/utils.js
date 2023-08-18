const format = require("pg-format");
const db = require("./connection.js");

const checkExists = async (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  try {
    const dbOutput = await db.query(queryStr, [value]);

    if (dbOutput.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `404 Not Found`,
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
const patchVotes = async (table, column, obj, id) => {
  try{
  const queryStr1 = format("SELECT votes FROM %I WHERE %I = $1", table, column);
  const currentVote = await db.query(queryStr1, [id]);
  const votes = currentVote.rows[0].votes + obj.inc_votes;
  const values = [votes, id];
  const queryStr2 = format(
    "UPDATE %I SET votes = $1 WHERE %I = $2;",
    table,
    column
  );
 await db.query(queryStr2, values);
  }catch(error){
    if(error.message.includes('invalid input syntax')){
      return Promise.reject({status: 400, msg: '400 Bad Request'})
    }
    throw error
  }
};
const deleteItem = async (table, column, id) => {
  const value = [id]
  const queryStr = format("DELETE FROM %I WHERE %I = $1;", table, column)
  await db.query(queryStr, value)
}
module.exports = {checkExists, patchVotes, deleteItem};
