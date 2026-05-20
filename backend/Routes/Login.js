const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { sql, poolPromise } = require("../db");

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Gjenero tokens
function generateTokens(user) {
  const payload = {
    id:       user.id,
    username: user.username,
    email:    user.email,
    role:     user.role,
  };
  const accessToken  = jwt.sign(payload, ACCESS_SECRET,  { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d"  });
  return { accessToken, refreshToken };
}

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query(`
        SELECT * FROM Users
        WHERE email = @username OR username = @username
      `);

    const user = result.recordset[0];

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.password_hash !== password) return res.status(401).json({ message: "Password incorrect" });

    const { accessToken, refreshToken } = generateTokens(user);

    // Ruaj refresh token në DB
    await pool.request()
      .input("id", sql.Int, user.id)
      .input("token", sql.NVarChar, refreshToken)
      .query(`UPDATE Users SET refresh_token = @token WHERE id = @id`);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role,
        emri:     user.emri,
        mbiemri:  user.mbiemri,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /refresh  — merr access token të ri
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, decoded.id)
      .query(`SELECT refresh_token FROM Users WHERE id = @id`);

    const saved = result.recordset[0]?.refresh_token;
    if (saved !== refreshToken) return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, email: decoded.email, role: decoded.role },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });

  } catch (err) {
    res.status(403).json({ message: "Refresh token expired or invalid" });
  }
});

// POST /logout
router.post("/logout", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.sendStatus(204);

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, userId)
      .query(`UPDATE Users SET refresh_token = NULL WHERE id = @id`);
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
