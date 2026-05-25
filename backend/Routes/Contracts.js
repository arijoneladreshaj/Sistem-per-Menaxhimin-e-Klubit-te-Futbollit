const express = require("express");
const router  = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const ROLES = ["Admin", "Menaxher"];

// GET all
router.get("/", verifyToken, requireRole(...ROLES), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        c.*,
        p.emri + ' ' + p.mbiemri AS emri_lojtarit,
        p.pozicioni,
        p.numri_faneles
      FROM Contracts c
      INNER JOIN Players p ON c.player_id = p.id
      ORDER BY c.data_perfundimit ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single
router.get("/:id", verifyToken, requireRole(...ROLES), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT c.*, p.emri + ' ' + p.mbiemri AS emri_lojtarit
        FROM Contracts c
        INNER JOIN Players p ON c.player_id = p.id
        WHERE c.id = @id
      `);
    if (!result.recordset[0]) return res.status(404).json({ error: "Kontrata nuk u gjet" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post("/", verifyToken, requireRole(...ROLES), async (req, res) => {
  try {
    const { player_id, data_fillimit, data_perfundimit, paga, bonus, lloji, statusi, kushtet } = req.body;
    if (!player_id || !data_fillimit || !data_perfundimit)
      return res.status(400).json({ error: "Player, data fillimit dhe data perfundimit janë të detyrueshme" });

    const pool = await poolPromise;
    await pool.request()
      .input("player_id",       sql.Int,           player_id)
      .input("club_id",         sql.Int,            1)
      .input("data_fillimit",   sql.Date,           data_fillimit)
      .input("data_perfundimit",sql.Date,           data_perfundimit)
      .input("paga",            sql.Decimal(10,2),  paga    || null)
      .input("bonus",           sql.Decimal(10,2),  bonus   || null)
      .input("lloji",           sql.NVarChar(50),   lloji   || "Permanent")
      .input("statusi",         sql.NVarChar(20),   statusi || "Aktiv")
      .input("kushtet",         sql.NVarChar(500),  kushtet || null)
      .query(`
        INSERT INTO Contracts (player_id, club_id, data_fillimit, data_perfundimit, paga, bonus, lloji, statusi, kushtet)
        VALUES (@player_id, @club_id, @data_fillimit, @data_perfundimit, @paga, @bonus, @lloji, @statusi, @kushtet)
      `);
    res.status(201).json({ success: true, message: "Kontrata u shtua" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put("/:id", verifyToken, requireRole(...ROLES), async (req, res) => {
  try {
    const { player_id, data_fillimit, data_perfundimit, paga, bonus, lloji, statusi, kushtet } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("id",              sql.Int,           req.params.id)
      .input("player_id",       sql.Int,           player_id)
      .input("data_fillimit",   sql.Date,           data_fillimit)
      .input("data_perfundimit",sql.Date,           data_perfundimit)
      .input("paga",            sql.Decimal(10,2),  paga    || null)
      .input("bonus",           sql.Decimal(10,2),  bonus   || null)
      .input("lloji",           sql.NVarChar(50),   lloji)
      .input("statusi",         sql.NVarChar(20),   statusi)
      .input("kushtet",         sql.NVarChar(500),  kushtet || null)
      .query(`
        UPDATE Contracts SET
          player_id        = @player_id,
          data_fillimit    = @data_fillimit,
          data_perfundimit = @data_perfundimit,
          paga             = @paga,
          bonus            = @bonus,
          lloji            = @lloji,
          statusi          = @statusi,
          kushtet          = @kushtet
        WHERE id = @id
      `);
    res.json({ success: true, message: "Kontrata u përditësua" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", verifyToken, requireRole(...ROLES), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Contracts WHERE id = @id");
    res.json({ success: true, message: "Kontrata u fshi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
