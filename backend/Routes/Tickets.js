const express = require("express");
const router  = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// ── PUBLIKE ────────────────────────────────────────────────────

// GET /api/tickets/booked/:matchId/:sektori — ulëset e zëna (pa token)
router.get("/booked/:matchId/:sektori", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("match_id", sql.Int,      req.params.matchId)
      .input("sektori",  sql.NVarChar, req.params.sektori)
      .query(`
        SELECT numri_uleses FROM Tickets
        WHERE match_id = @match_id AND sektori = @sektori
        AND statusi IN ('E rezervuar', 'E shitur')
      `);
    res.json(result.recordset.map(r => r.numri_uleses));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ME TOKEN ───────────────────────────────────────────────────

// GET /api/tickets/my — biletat e userit të kyçur
router.get("/my", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("user_id", sql.Int, req.user.id)
      .query(`
        SELECT t.*, m.ekipi_kundershtare, m.data_ndeshjes, m.stadiumi
        FROM Tickets t
        LEFT JOIN Matches m ON t.match_id = m.id
        WHERE t.user_id = @user_id
        ORDER BY t.created_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets — të gjitha biletat (admin)
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT t.*,
             m.ekipi_kundershtare, m.data_ndeshjes, m.stadiumi,
             u.emri AS user_emri, u.mbiemri AS user_mbiemri, u.email AS user_email
      FROM Tickets t
      LEFT JOIN Matches m ON t.match_id = m.id
      LEFT JOIN Users   u ON t.user_id  = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/match/:matchId — biletat e një ndeshje (admin)
router.get("/match/:matchId", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("match_id", sql.Int, req.params.matchId)
      .query(`
        SELECT t.*, u.emri AS user_emri, u.mbiemri AS user_mbiemri
        FROM Tickets t
        LEFT JOIN Users u ON t.user_id = u.id
        WHERE t.match_id = @match_id
        ORDER BY t.sektori, t.numri_uleses
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets — blej bileta (user i loguar)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { match_id, seats } = req.body;
    const user_id = req.user.id;

    if (!match_id || !seats || seats.length === 0)
      return res.status(400).json({ error: "Të dhënat mungojnë" });

    const pool = await poolPromise;
    for (const seat of seats) {
      await pool.request()
        .input("match_id",         sql.Int,      match_id)
        .input("user_id",          sql.Int,      user_id)
        .input("sektori",          sql.NVarChar, seat.sectorId || seat.sectorName)
        .input("numri_uleses",     sql.Int,      seat.seatNumber)
        .input("emri_bleresit",    sql.NVarChar, seat.firstName || null)
        .input("mbiemri_bleresit", sql.NVarChar, seat.lastName  || null)
        .input("cmimi",            sql.Decimal,  seat.price)
        .input("is_vip",           sql.Bit,      seat.isVip ? 1 : 0)
        .input("statusi",          sql.NVarChar, seat.statusi || "E shitur")
        .query(`
          INSERT INTO Tickets
            (match_id, user_id, sektori, numri_uleses, emri_bleresit, mbiemri_bleresit, cmimi, is_vip, statusi)
          VALUES
            (@match_id, @user_id, @sektori, @numri_uleses, @emri_bleresit, @mbiemri_bleresit, @cmimi, @is_vip, @statusi)
        `);
    }
    res.json({ success: true, message: "Biletat u ruajtën me sukses" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tickets/:id — ndrysho biletën (admin)
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { statusi, sektori, numri_uleses, emri_bleresit, mbiemri_bleresit, cmimi, is_vip, match_id } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("id",               sql.Int,      req.params.id)
      .input("statusi",          sql.NVarChar, statusi          || null)
      .input("sektori",          sql.NVarChar, sektori          || null)
      .input("numri_uleses",     sql.Int,      numri_uleses     || null)
      .input("emri_bleresit",    sql.NVarChar, emri_bleresit    || null)
      .input("mbiemri_bleresit", sql.NVarChar, mbiemri_bleresit || null)
      .input("cmimi",            sql.Decimal,  cmimi            || null)
      .input("is_vip",           sql.Bit,      is_vip ? 1 : 0)
      .input("match_id",         sql.Int,      match_id         || null)
      .query(`
        UPDATE Tickets SET
          statusi          = COALESCE(@statusi,          statusi),
          sektori          = COALESCE(@sektori,          sektori),
          numri_uleses     = COALESCE(@numri_uleses,     numri_uleses),
          emri_bleresit    = COALESCE(@emri_bleresit,    emri_bleresit),
          mbiemri_bleresit = COALESCE(@mbiemri_bleresit, mbiemri_bleresit),
          cmimi            = COALESCE(@cmimi,            cmimi),
          is_vip           = @is_vip,
          match_id         = COALESCE(@match_id,         match_id)
        WHERE id = @id
      `);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tickets/:id (admin)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Tickets WHERE id = @id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
