const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcryptjs");
const { sql, poolPromise } = require("../db");

router.post("/register", async (req, res) => {
  try {
    const { username, emri, mbiemri, datelindja, email, password } = req.body;

    if (!username || !emri || !mbiemri || !email || !password) {
      return res.status(400).json({ message: "Fushat obligative mungojnë" });
    }
    if (username.trim() === email.trim()) {
      return res.status(400).json({ message: "Username nuk mund të jetë i njëjtë me email-in" });
    }

    const pool = await poolPromise;

    const existing = await pool.request()
      .input("email",    sql.NVarChar, email)
      .input("username", sql.NVarChar, username)
      .query("SELECT id, email, username FROM Users WHERE email = @email OR username = @username");

    if (existing.recordset.length > 0) {
      for (const taken of existing.recordset) {
        if (taken.email.toLowerCase() === email.toLowerCase())
          return res.status(409).json({ message: "Ky email është i regjistruar tashmë" });
        if (taken.username.toLowerCase() === username.toLowerCase())
          return res.status(409).json({ message: "Ky username është i zënë" });
      }
    }

    await pool.request()
      .input("emri", sql.NVarChar, emri)
      .input("mbiemri", sql.NVarChar, mbiemri)
      .input("datelindja", sql.Date, datelindja || null)
      .input("email", sql.NVarChar, email)
      .input("username", sql.NVarChar, username)
      .input("password_hash", sql.NVarChar, await bcrypt.hash(password, 10))
      .input("role", sql.NVarChar, "user")
      .query(`
        INSERT INTO Users (emri, mbiemri, datelindja, email, username, password_hash, role)
        VALUES (@emri, @mbiemri, @datelindja, @email, @username, @password_hash, @role)
      `);

    res.json({ success: true, message: "Useri u regjistrua me sukses" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
