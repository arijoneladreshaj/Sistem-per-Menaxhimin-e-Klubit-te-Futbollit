require("dotenv").config();
const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 1433,
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("DB e lidhur!");
    return pool;
  })
  .catch((err) => console.error("DB error:", err.message));

module.exports = { sql, poolPromise };
