const mysql = require("mysql2/promise");
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

const mysqlConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: 60,
  waitForConnections: true,
  multipleStatements: true,
};

const pool = mysql.createPool(mysqlConfig);

module.exports = {
  mysql,
  pool,
};
