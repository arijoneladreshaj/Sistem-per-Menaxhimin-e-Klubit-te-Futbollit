const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Seasons ORDER BY id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ACTIVE
router.get("/active", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT TOP 1 * FROM Seasons WHERE statusi = 'Aktiv'");
    res.json(result.recordset[0] || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET STATS for a season (matches within date range)
router.get("/:id/stats", async (req, res) => {
  try {
    const pool = await poolPromise;

    const seasonRes = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Seasons WHERE id = @id");
    const season = seasonRes.recordset[0];
    if (!season) return res.status(404).json({ message: "Sezoni nuk u gjet" });

    const matchRes = await pool.request()
      .input("start", sql.Date, season.viti_fillimit)
      .input("end",   sql.Date, season.viti_perfundimit)
      .query(`
        SELECT rezultati_shtepia, rezultati_jashte, statusi, ekipi_kundershtare, data_ndeshjes
        FROM Matches
        WHERE data_ndeshjes >= @start AND data_ndeshjes <= @end
      `);

    const matches = matchRes.recordset;
    const played = matches.filter(m => m.statusi === "Luajtur");

    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    played.forEach(m => {
      const h = Number(m.rezultati_shtepia || 0);
      const a = Number(m.rezultati_jashte || 0);
      gf += h; ga += a;
      if (h > a) wins++;
      else if (h === a) draws++;
      else losses++;
    });

    const form = played
      .sort((a, b) => new Date(b.data_ndeshjes) - new Date(a.data_ndeshjes))
      .slice(0, 5)
      .map(m => {
        const h = Number(m.rezultati_shtepia || 0);
        const a = Number(m.rezultati_jashte || 0);
        return {
          opponent: m.ekipi_kundershtare,
          score: `${h}–${a}`,
          result: h > a ? "W" : h === a ? "D" : "L",
        };
      });

    res.json({
      played: played.length,
      upcoming: matches.length - played.length,
      wins, draws, losses,
      gf, ga, gd: gf - ga,
      points: wins * 3 + draws,
      form,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { emertimi, viti_fillimit, viti_perfundimit, kompeticionit, statusi,
            cmimi_adult, cmimi_koncesion, cmimi_youth, cmimi_under14,
            deadline_earlybird, perfitesite } = req.body;
    const pool = await poolPromise;

    if (statusi === "Aktiv") {
      await pool.request().query("UPDATE Seasons SET statusi='Mbyllur' WHERE statusi='Aktiv'");
    }

    await pool.request()
      .input("emertimi",          sql.NVarChar,  emertimi)
      .input("viti_fillimit",     sql.Date,      viti_fillimit)
      .input("viti_perfundimit",  sql.Date,      viti_perfundimit)
      .input("kompeticionit",     sql.NVarChar,  kompeticionit || "")
      .input("statusi",           sql.NVarChar,  statusi || "Ardhshëm")
      .input("cmimi_adult",       sql.Decimal,   cmimi_adult || null)
      .input("cmimi_koncesion",   sql.Decimal,   cmimi_koncesion || null)
      .input("cmimi_youth",       sql.Decimal,   cmimi_youth || null)
      .input("cmimi_under14",     sql.Decimal,   cmimi_under14 || null)
      .input("deadline_earlybird",sql.Date,      deadline_earlybird || null)
      .input("perfitesite",       sql.NVarChar,  perfitesite || "")
      .query(`
        INSERT INTO Seasons
          (emertimi, viti_fillimit, viti_perfundimit, kompeticionit, statusi,
           cmimi_adult, cmimi_koncesion, cmimi_youth, cmimi_under14,
           deadline_earlybird, perfitesite)
        VALUES
          (@emertimi, @viti_fillimit, @viti_perfundimit, @kompeticionit, @statusi,
           @cmimi_adult, @cmimi_koncesion, @cmimi_youth, @cmimi_under14,
           @deadline_earlybird, @perfitesite)
      `);
    res.json({ message: "Sezoni u shtua" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { emertimi, viti_fillimit, viti_perfundimit, kompeticionit, statusi,
            cmimi_adult, cmimi_koncesion, cmimi_youth, cmimi_under14,
            deadline_earlybird, perfitesite } = req.body;
    const pool = await poolPromise;

    if (statusi === "Aktiv") {
      await pool.request()
        .input("id", sql.Int, req.params.id)
        .query("UPDATE Seasons SET statusi='Mbyllur' WHERE statusi='Aktiv' AND id != @id");
    }

    await pool.request()
      .input("id",                sql.Int,       req.params.id)
      .input("emertimi",          sql.NVarChar,  emertimi)
      .input("viti_fillimit",     sql.Date,      viti_fillimit)
      .input("viti_perfundimit",  sql.Date,      viti_perfundimit)
      .input("kompeticionit",     sql.NVarChar,  kompeticionit || "")
      .input("statusi",           sql.NVarChar,  statusi || "Ardhshëm")
      .input("cmimi_adult",       sql.Decimal,   cmimi_adult || null)
      .input("cmimi_koncesion",   sql.Decimal,   cmimi_koncesion || null)
      .input("cmimi_youth",       sql.Decimal,   cmimi_youth || null)
      .input("cmimi_under14",     sql.Decimal,   cmimi_under14 || null)
      .input("deadline_earlybird",sql.Date,      deadline_earlybird || null)
      .input("perfitesite",       sql.NVarChar,  perfitesite || "")
      .query(`
        UPDATE Seasons SET
          emertimi=@emertimi, viti_fillimit=@viti_fillimit,
          viti_perfundimit=@viti_perfundimit, kompeticionit=@kompeticionit,
          statusi=@statusi, cmimi_adult=@cmimi_adult,
          cmimi_koncesion=@cmimi_koncesion, cmimi_youth=@cmimi_youth,
          cmimi_under14=@cmimi_under14, deadline_earlybird=@deadline_earlybird,
          perfitesite=@perfitesite
        WHERE id=@id
      `);
    res.json({ message: "Sezoni u ndryshua" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH activate
router.patch("/:id/activate", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().query("UPDATE Seasons SET statusi='Mbyllur' WHERE statusi='Aktiv'");
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("UPDATE Seasons SET statusi='Aktiv' WHERE id=@id");
    res.json({ message: "Sezoni u vendos aktiv" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Seasons WHERE id=@id");
    res.json({ message: "Sezoni u fshi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
