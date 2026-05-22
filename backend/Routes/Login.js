const express = require("express");
const jwt     = require("jsonwebtoken");
const router  = express.Router();
const { sql, poolPromise } = require("../db");

function generateTokens(user) {
  const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d"  });
  return { accessToken, refreshToken };
}

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE email = @username OR username = @username");

    const user = result.recordset[0];
    if (!user)                          return res.status(401).json({ message: "Përdoruesi nuk u gjet" });
    if (user.password_hash !== password) return res.status(401).json({ message: "Fjalëkalimi është i gabuar" });

    const { accessToken, refreshToken } = generateTokens(user);

    // Ruaj refresh token në tabelën RefreshTokens
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ditë
    await pool.request()
      .input("user_id",    sql.Int,       user.id)
      .input("token",      sql.NVarChar,  refreshToken)
      .input("expires_at", sql.DateTime, expires)
      .query(`
        INSERT INTO RefreshTokens (user_id, token, expires_at)
        VALUES (@user_id, @token, @expires_at)
      `);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, emri: user.emri, mbiemri: user.mbiemri },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /refresh  — merr access token të ri
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token mungon" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const pool = await poolPromise;
    const result = await pool.request()
      .input("token", sql.NVarChar, refreshToken)
      .query(`
        SELECT * FROM RefreshTokens
        WHERE token = @token AND is_revoked = 0 AND expires_at > GETDATE()
      `);

    if (!result.recordset[0]) return res.status(403).json({ message: "Refresh token i pavlefshëm" });

    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });

  } catch (err) {
    res.status(403).json({ message: "Refresh token ka skaduar ose është i pavlefshëm" });
  }
});

// POST /logout
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(204);

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("token", sql.NVarChar, refreshToken)
      .query("UPDATE RefreshTokens SET is_revoked = 1 WHERE token = @token");
    res.json({ message: "U çkyç me sukses" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
