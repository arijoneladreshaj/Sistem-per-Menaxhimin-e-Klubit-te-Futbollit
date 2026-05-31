const jwt   = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sql, poolPromise } = require("../config/db");

function generateTokens(user) {
  const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d"  });
  return { accessToken, refreshToken };
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE email = @username OR username = @username");

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Përdoruesi nuk u gjet" });

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) return res.status(401).json({ message: "Fjalëkalimi është i gabuar" });

    const { accessToken, refreshToken } = generateTokens(user);

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.request()
      .input("user_id",    sql.Int,      user.id)
      .input("token",      sql.NVarChar, refreshToken)
      .input("expires_at", sql.DateTime, expires)
      .query("INSERT INTO RefreshTokens (user_id, token, expires_at) VALUES (@user_id, @token, @expires_at)");

    const prefResult = await pool.request()
      .input("uid", sql.Int, user.id)
      .query("SELECT topics FROM UserPreferences WHERE user_id = @uid");
    const topics = prefResult.recordset[0]?.topics ?? "[]";
    const hasPreferences = JSON.parse(topics).length > 0;

    res.json({
      accessToken,
      refreshToken,
      hasPreferences,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, emri: user.emri, mbiemri: user.mbiemri, datelindja: user.datelindja || "" },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token mungon" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const pool = await poolPromise;

    const result = await pool.request()
      .input("token", sql.NVarChar, refreshToken)
      .query("SELECT * FROM RefreshTokens WHERE token = @token AND is_revoked = 0 AND expires_at > GETDATE()");

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
};

exports.logout = async (req, res) => {
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
};

exports.register = async (req, res) => {
  try {
    const { username, emri, mbiemri, datelindja, email, password } = req.body;

    if (!username || !emri || !mbiemri || !email || !password)
      return res.status(400).json({ message: "Fushat obligative mungojnë" });
    if (username.trim() === email.trim())
      return res.status(400).json({ message: "Username nuk mund të jetë i njëjtë me email-in" });

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

    const userRes = await pool.request()
      .input("emri",         sql.NVarChar, emri)
      .input("mbiemri",      sql.NVarChar, mbiemri)
      .input("datelindja",   sql.Date,     datelindja || null)
      .input("email",        sql.NVarChar, email)
      .input("username",     sql.NVarChar, username)
      .input("password_hash",sql.NVarChar, await bcrypt.hash(password, 10))
      .input("role",         sql.NVarChar, "user")
      .query(`
        INSERT INTO Users (emri, mbiemri, datelindja, email, username, password_hash, role)
        OUTPUT INSERTED.id
        VALUES (@emri, @mbiemri, @datelindja, @email, @username, @password_hash, @role)
      `);

    const newUserId = userRes.recordset[0].id;

    await pool.request()
      .input("user_id", sql.Int, newUserId)
      .query("INSERT INTO UserPreferences (user_id, topics) VALUES (@user_id, '[]')");

    const roleRes = await pool.request()
      .input("name", sql.NVarChar, "user")
      .query("SELECT id FROM Roles WHERE name = @name");
    const roleId = roleRes.recordset[0]?.id;
    if (roleId) {
      await pool.request()
        .input("user_id", sql.Int, newUserId)
        .input("role_id", sql.Int, roleId)
        .query("INSERT INTO UserRoles (user_id, role_id) VALUES (@user_id, @role_id)");
    }

    res.json({ success: true, message: "Useri u regjistrua me sukses" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
