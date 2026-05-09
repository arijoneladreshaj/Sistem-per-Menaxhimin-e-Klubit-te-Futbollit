require("dotenv").config({ path: "../.env" });

const sql = require("mssql/msnodesqlv8");

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,

  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    encrypt: false,
  },

  driver: "msnodesqlv8",

  connectionString:
    `Driver={SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=Yes;`
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("DB e lidhur!");
    return pool;
  })
  .catch(err => console.log("DB error:", err.message));

module.exports = { sql, poolPromise };