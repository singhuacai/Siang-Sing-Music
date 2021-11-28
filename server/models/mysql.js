require("dotenv").config();
const mysql = require("mysql2/promise");
const env = process.env.NODE_ENV || "production";
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_DATABASE_TEST } = process.env;

const mysqlConfig = {
  production: {
    // for EC2 machine
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
  development: {
    // for localhost development
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
  test: {
    // for automation testing (command: npm run test)
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE_TEST,
  },
};
let mysqlEnv = mysqlConfig[env];
mysqlEnv.connectionLimit = 60;
mysqlEnv.waitForConnections = true;
mysqlEnv.multipleStatements = true;
const pool = mysql.createPool(mysqlEnv);

module.exports = {
  mysql,
  pool,
};
