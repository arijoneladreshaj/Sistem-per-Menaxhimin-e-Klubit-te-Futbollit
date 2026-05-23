const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const { sql, poolPromise } = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const ALLOWED_ROLES = ["Admin", "Trajner", "Menaxher"];

// GET /api/admin/users — lista e të gjithë userëve
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      "SELECT id, username, emri, mbiemri, email, role, datelindja FROM Users ORDER BY id ASC"
    );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/users — admini krijon user të ri me rol
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { username, emri, mbiemri, email, password, role } = req.body;

    if (!username || !emri || !mbiemri || !email || !password || !role)
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme" });

    if (!ALLOWED_ROLES.includes(role))
      return res.status(400).json({ message: `Roli duhet të jetë: ${ALLOWED_ROLES.join(", ")}` });

    if (password.length < 6)
      return res.status(400).json({ message: "Fjalëkalimi duhet të ketë së paku 6 karaktere" });

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

    const hash = await bcrypt.hash(password, 10);

    const insert = await pool.request()
      .input("username",      sql.NVarChar, username.trim())
      .input("emri",          sql.NVarChar, emri.trim())
      .input("mbiemri",       sql.NVarChar, mbiemri.trim())
      .input("email",         sql.NVarChar, email.trim())
      .input("password_hash", sql.NVarChar, hash)
      .input("role",          sql.NVarChar, role)
      .query(`
        INSERT INTO Users (username, emri, mbiemri, email, password_hash, role)
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.emri, INSERTED.mbiemri,
               INSERTED.email, INSERTED.role
        VALUES (@username, @emri, @mbiemri, @email, @password_hash, @role)
      `);

    res.status(201).json({ success: true, user: insert.recordset[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id — ndrysho të dhënat e userit
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, emri, mbiemri, email, password } = req.body;

    if (!username?.trim() || !emri?.trim() || !mbiemri?.trim() || !email?.trim())
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme" });

    const pool = await poolPromise;

    const taken = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email",    sql.NVarChar, email)
      .input("id",       sql.Int,      id)
      .query("SELECT id FROM Users WHERE (username = @username OR email = @email) AND id <> @id");

    if (taken.recordset.length > 0)
      return res.status(409).json({ message: "Username ose email është i zënë" });

    const request = pool.request()
      .input("id",       sql.Int,      id)
      .input("username", sql.NVarChar, username.trim())
      .input("emri",     sql.NVarChar, emri.trim())
      .input("mbiemri",  sql.NVarChar, mbiemri.trim())
      .input("email",    sql.NVarChar, email.trim());

    let query = "UPDATE Users SET username=@username, emri=@emri, mbiemri=@mbiemri, email=@email";

    if (password && password.length >= 6) {
      const newHash = await bcrypt.hash(password, 10);
      request.input("hash", sql.NVarChar, newHash);
      query += ", password_hash=@hash";
    }

    query += " WHERE id=@id";
    await request.query(query);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/role — ndrysho rolin e userit
router.put("/:id/role", verifyToken, requireAdmin, async (req, res) => {
  try {
    const id   = Number(req.params.id);
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role))
      return res.status(400).json({ message: `Roli duhet të jetë: ${ALLOWED_ROLES.join(", ")}` });

    if (id === req.user.id)
      return res.status(400).json({ message: "Nuk mund të ndryshosh rolin tënd" });

    const pool = await poolPromise;

    const user = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT id FROM Users WHERE id = @id");

    if (!user.recordset[0])
      return res.status(404).json({ message: "Useri nuk u gjet" });

    await pool.request()
      .input("id",   sql.Int,      id)
      .input("role", sql.NVarChar, role)
      .query("UPDATE Users SET role = @role WHERE id = @id");

    res.json({ success: true, message: "Roli u ndryshua" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id — admini fshin cilindo user
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (id === req.user.id)
      return res.status(400).json({ message: "Nuk mund të fshish llogarinë tënde këtu" });

    const pool = await poolPromise;

    const user = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT id FROM Users WHERE id = @id");

    if (!user.recordset[0])
      return res.status(404).json({ message: "Useri nuk u gjet" });

    await pool.request()
      .input("user_id", sql.Int, id)
      .query("UPDATE RefreshTokens SET is_revoked = 1 WHERE user_id = @user_id");

    await pool.request()
      .input("user_id", sql.Int, id)
      .query("UPDATE Tickets SET user_id = NULL WHERE user_id = @user_id");

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Users WHERE id = @id");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
