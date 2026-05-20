const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

// Funksioni që përditëson statusin e lojtarit bazuar në dëmtime
async function updatePlayerStatus(pool, player_id) {
  const result = await pool.request()
    .input("pid", sql.Int, player_id)
    .query(`
      SELECT COUNT(*) as cnt 
      FROM Injuries 
      WHERE player_id = @pid AND statusi IN ('Aktiv', 'Rikuperim')
    `);

  const newStatus = result.recordset[0].cnt > 0 ? 'Lenduar' : 'Aktiv';

  await pool.request()
    .input("pid", sql.Int, player_id)
    .input("statusi", sql.NVarChar, newStatus)
    .query("UPDATE Players SET statusi = @statusi WHERE id = @pid");
}

// GET all injuries with player info
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        i.*,
        p.emri + ' ' + p.mbiemri AS emri_lojtarit,
        p.pozicioni,
        p.numri_faneles
      FROM Injuries i
      INNER JOIN Players p ON i.player_id = p.id
      ORDER BY i.data_demtimit DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single injury
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Injuries WHERE id = @id");
    if (!result.recordset[0]) return res.status(404).json({ error: "Dëmtimi nuk u gjet" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE injury
router.post("/", async (req, res) => {
  try {
    const { player_id, lloji_demtimit, pershkrimi, data_demtimit, data_rikthimit, statusi } = req.body;
    if (!player_id || !lloji_demtimit || !data_demtimit) {
      return res.status(400).json({ error: "Fushat obligative mungojnë" });
    }
    const pool = await poolPromise;
    await pool.request()
      .input("player_id",      sql.Int,      player_id)
      .input("lloji_demtimit", sql.NVarChar, lloji_demtimit)
      .input("pershkrimi",     sql.NVarChar, pershkrimi || null)
      .input("data_demtimit",  sql.Date,     data_demtimit)
      .input("data_rikthimit", sql.Date,     data_rikthimit || null)
      .input("statusi",        sql.NVarChar, statusi || "Aktiv")
      .query(`
        INSERT INTO Injuries (player_id, lloji_demtimit, pershkrimi, data_demtimit, data_rikthimit, statusi)
        VALUES (@player_id, @lloji_demtimit, @pershkrimi, @data_demtimit, @data_rikthimit, @statusi)
      `);

    await updatePlayerStatus(pool, player_id);

    res.json({ success: true, message: "Dëmtimi u shtua me sukses" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE injury
router.put("/:id", async (req, res) => {
  try {
    const { player_id, lloji_demtimit, pershkrimi, data_demtimit, data_rikthimit, statusi } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("id",             sql.Int,      req.params.id)
      .input("player_id",      sql.Int,      player_id)
      .input("lloji_demtimit", sql.NVarChar, lloji_demtimit)
      .input("pershkrimi",     sql.NVarChar, pershkrimi || null)
      .input("data_demtimit",  sql.Date,     data_demtimit)
      .input("data_rikthimit", sql.Date,     data_rikthimit || null)
      .input("statusi",        sql.NVarChar, statusi)
      .query(`
        UPDATE Injuries
        SET player_id      = @player_id,
            lloji_demtimit = @lloji_demtimit,
            pershkrimi     = @pershkrimi,
            data_demtimit  = @data_demtimit,
            data_rikthimit = @data_rikthimit,
            statusi        = @statusi
        WHERE id = @id
      `);

    await updatePlayerStatus(pool, player_id);

    res.json({ success: true, message: "Dëmtimi u përditësua" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE injury
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    // Merr player_id PARA se ta fshish
    const inj = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT player_id FROM Injuries WHERE id = @id");

    const player_id = inj.recordset[0]?.player_id;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Injuries WHERE id = @id");

    if (player_id) {
      await updatePlayerStatus(pool, player_id);
    }

    res.json({ success: true, message: "Dëmtimi u fshi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;