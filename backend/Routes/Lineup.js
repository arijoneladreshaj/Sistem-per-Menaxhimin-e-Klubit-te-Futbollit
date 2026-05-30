const express  = require("express");
const router   = express.Router();
const { sql, poolPromise }         = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// GET /api/lineup/:match_id — formacioni + lojtaret
router.get("/:match_id", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // Lojtaret e zgjedhur per kete ndeshje
    const lineupRes = await pool.request()
      .input("match_id", sql.Int, req.params.match_id)
      .query(`
        SELECT
          ml.slot_id, ml.player_id, ml.roli, ml.formacioni,
          p.emri, p.mbiemri, p.numri_faneles, p.pozicioni
        FROM MatchLineup ml
        JOIN Players p ON p.id = ml.player_id
        WHERE ml.match_id = @match_id
      `);

    // Te gjithe lojtaret aktiv (per selectorin)
    const playersRes = await pool.request().query(`
      SELECT
        p.id AS player_id,
        p.emri, p.mbiemri, p.numri_faneles, p.pozicioni
      FROM Players p
      WHERE p.statusi = 'Aktiv'
      ORDER BY
        CASE p.pozicioni
          WHEN 'Portier'   THEN 1
          WHEN 'Mbrojtës'  THEN 2
          WHEN 'Mesfushor' THEN 3
          WHEN 'Sulmues'   THEN 4
          ELSE 5
        END, p.numri_faneles
    `);

    const formacioni = lineupRes.recordset[0]?.formacioni || "4-4-2";
    const titularet  = lineupRes.recordset.filter(r => r.roli === "Titular");
    const rezervat   = lineupRes.recordset.filter(r => r.roli === "Rezerve");

    res.json({ formacioni, titularet, rezervat, players: playersRes.recordset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /api/lineup/:match_id — ruaj formacionin (vetem Trajner dhe Admin)
router.put("/:match_id", verifyToken, requireRole("Admin", "Trajner"), async (req, res) => {
  try {
    const matchId = req.params.match_id;
    const { formacioni, titularet, rezervat } = req.body;
    const pool = await poolPromise;

    // Fshi formacionin e vjeter
    await pool.request()
      .input("match_id", sql.Int, matchId)
      .query("DELETE FROM MatchLineup WHERE match_id = @match_id");

    // Shto titularet
    for (const entry of (titularet || [])) {
      if (!entry.player_id) continue;
      await pool.request()
        .input("match_id",   sql.Int,          matchId)
        .input("player_id",  sql.Int,          entry.player_id)
        .input("slot_id",    sql.NVarChar(10),  entry.slot_id || null)
        .input("formacioni", sql.NVarChar(10),  formacioni || "4-4-2")
        .input("roli",       sql.NVarChar(15),  "Titular")
        .query(`
          INSERT INTO MatchLineup (match_id, player_id, roli, slot_id, formacioni)
          VALUES (@match_id, @player_id, @roli, @slot_id, @formacioni)
        `);
    }

    // Shto rezervat (banke)
    for (const entry of (rezervat || [])) {
      if (!entry.player_id) continue;
      await pool.request()
        .input("match_id",   sql.Int,          matchId)
        .input("player_id",  sql.Int,          entry.player_id)
        .input("formacioni", sql.NVarChar(10),  formacioni || "4-4-2")
        .input("roli",       sql.NVarChar(15),  "Rezerve")
        .query(`
          INSERT INTO MatchLineup (match_id, player_id, roli, slot_id, formacioni)
          VALUES (@match_id, @player_id, @roli, NULL, @formacioni)
        `);
    }

    // Dergo njoftim te te gjithe lojtaret
    const matchRes = await pool.request()
      .input("id", sql.Int, matchId)
      .query("SELECT ekipi_kundershtare, data_ndeshjes, ora FROM Matches WHERE id = @id");

    const match       = matchRes.recordset[0];
    const kundershtar = match?.ekipi_kundershtare || "kundershtar";
    const data        = match?.data_ndeshjes
      ? new Date(match.data_ndeshjes).toLocaleDateString("sq-AL", { day: "numeric", month: "long", timeZone: "UTC" })
      : null;
    const ora         = match?.ora ? String(match.ora).slice(0, 5) : null;
    const koha        = [data, ora].filter(Boolean).join(" · ");

    // Dergo njoftim te te gjithe lojtaret
    const lojtaretRes = await pool.request()
      .query("SELECT id FROM Users WHERE role = 'Lojtari'");

    for (const u of lojtaretRes.recordset) {
      await pool.request()
        .input("user_id", sql.Int,          u.id)
        .input("titulli", sql.NVarChar(200), `Formacioni u publikua: Man United vs ${kundershtar}`)
        .input("mesazhi", sql.NVarChar(500), `Trajneri publikoi formacionin për ndeshjen kundër ${kundershtar}${koha ? ` · ${koha}` : ""}. Shiko tab-in "Ndeshja" për detaje.`)
        .query("INSERT INTO Notifications (user_id, titulli, mesazhi, created_at) VALUES (@user_id, @titulli, @mesazhi, GETUTCDATE())");
    }

    res.json({ success: true, message: "Formacioni u ruajt" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
