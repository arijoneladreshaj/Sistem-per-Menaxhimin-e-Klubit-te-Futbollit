const express = require("express");
const router = express.Router();

const { sql, poolPromise } = require("../db");


// GET all matches
router.get("/", async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        Matches.*,
        Clubs.emertimi AS club_name
      FROM Matches
      INNER JOIN Clubs
        ON Matches.club_id = Clubs.id
      ORDER BY Matches.data_ndeshjes DESC
    `);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET single match
router.get("/:id", async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT *
        FROM Matches
        WHERE id = @id
      `);

    if (!result.recordset[0]) {
      return res.status(404).json({
        error: "Ndeshja nuk u gjet"
      });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE match
router.post("/", async (req, res) => {
  try {

    const {
      club_id,
      ekipi_kundershtare,
      data_ndeshjes,
      ora,
      stadiumi,
      lloji_kompeticionit,
      rezultati_shtepia,
      rezultati_jashte,
      statusi,
      season_id
    } = req.body;

    // VALIDATION
    if (!club_id || !ekipi_kundershtare || !data_ndeshjes) {
      return res.status(400).json({
        error: "Fushat obligative mungojnë"
      });
    }

    const pool = await poolPromise;

    await pool.request()
      .input("club_id", sql.Int, club_id)
      .input("ekipi_kundershtare", sql.NVarChar, ekipi_kundershtare)
      .input("data_ndeshjes", sql.Date, data_ndeshjes)
      .input("ora", sql.Time, ora)
      .input("stadiumi", sql.NVarChar, stadiumi)
      .input("lloji_kompeticionit", sql.NVarChar, lloji_kompeticionit)
      .input("rezultati_shtepia", sql.TinyInt, rezultati_shtepia)
      .input("rezultati_jashte", sql.TinyInt, rezultati_jashte)
      .input("statusi", sql.NVarChar, statusi)
      .input("season_id", sql.Int, season_id)

      .query(`
        INSERT INTO Matches
        (
          club_id,
          ekipi_kundershtare,
          data_ndeshjes,
          ora,
          stadiumi,
          lloji_kompeticionit,
          rezultati_shtepia,
          rezultati_jashte,
          statusi,
          season_id
        )
        VALUES
        (
          @club_id,
          @ekipi_kundershtare,
          @data_ndeshjes,
          @ora,
          @stadiumi,
          @lloji_kompeticionit,
          @rezultati_shtepia,
          @rezultati_jashte,
          @statusi,
          @season_id
        )
      `);

    res.json({
      success: true,
      message: "Ndeshja u shtua me sukses"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE match
router.put("/:id", async (req, res) => {
  try {

    const {
      rezultati_shtepia,
      rezultati_jashte,
      statusi
    } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("rezultati_shtepia", sql.TinyInt, rezultati_shtepia)
      .input("rezultati_jashte", sql.TinyInt, rezultati_jashte)
      .input("statusi", sql.NVarChar, statusi)

      .query(`
        UPDATE Matches
        SET
          rezultati_shtepia = @rezultati_shtepia,
          rezultati_jashte = @rezultati_jashte,
          statusi = @statusi,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: "Ndeshja u përditësua"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE match
router.delete("/:id", async (req, res) => {
  try {

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        DELETE FROM Matches
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: "Ndeshja u fshi"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;