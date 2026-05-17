const express = require("express");

const router = express.Router();

const { sql, poolPromise } = require("../db");


router.post("/login", async (req, res) => {

  try {

    const { username, password } = req.body;

    const pool = await poolPromise;

    const result = await pool
      .request()

      .input("username", sql.NVarChar, username)

      .query(`
        SELECT * FROM Users
        WHERE email = @username
        OR username = @username
      `);

    const user = result.recordset[0];

    if (!user) {

      return res.status(401).json({
        message: "User not found"
      });
    }

    if (user.password_hash !== password) {

      return res.status(401).json({
        message: "Password incorrect"
      });
    }

    res.json({

      id: user.id,

      username: user.username,

      email: user.email,

      role: user.role
    });

  } catch (err) {

    res.status(500).json(err.message);
  }
});

module.exports = router;