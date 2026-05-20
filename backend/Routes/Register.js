const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

router.post("/register", async (req, res) => {
  try {
    const { emri, mbiemri, datelindja, email, password } = req.body;

    if (!emri || !mbiemri || !email || !password) {
      return res.status(400).json({ message: "Fushat obligative mungojnë" });
    }

    const pool = await poolPromise;

    const existing = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id FROM Users WHERE email = @email");

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: "Ky email është i regjistruar tashmë" });
    }

    await pool.request()
      .input("emri", sql.NVarChar, emri)
      .input("mbiemri", sql.NVarChar, mbiemri)
      .input("datelindja", sql.Date, datelindja || null)
      .input("email", sql.NVarChar, email)
      .input("username", sql.NVarChar, email)
      .input("password_hash", sql.NVarChar, password)
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
