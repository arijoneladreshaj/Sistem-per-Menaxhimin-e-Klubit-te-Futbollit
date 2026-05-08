const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Players");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Players WHERE id = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { club_id, emri, mbiemri, data_lindjes, kombesia, pozicioni, numri_faneles, pesha, gjatesia, statusi, vlera_tregut } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("club_id", sql.Int, club_id)
      .input("emri", sql.NVarChar, emri)
      .input("mbiemri", sql.NVarChar, mbiemri)
      .input("data_lindjes", sql.Date, data_lindjes)
      .input("kombesia", sql.NVarChar, kombesia)
      .input("pozicioni", sql.NVarChar, pozicioni)
      .input("numri_faneles", sql.Int, numri_faneles)
      .input("pesha", sql.Decimal, pesha)
      .input("gjatesia", sql.Decimal, gjatesia)
      .input("statusi", sql.NVarChar, statusi)
      .input("vlera_tregut", sql.Decimal, vlera_tregut)
      .query(`INSERT INTO Players (club_id, emri, mbiemri, data_lindjes, kombesia, pozicioni, numri_faneles, pesha, gjatesia, statusi, vlera_tregut) 
              VALUES (@club_id, @emri, @mbiemri, @data_lindjes, @kombesia, @pozicioni, @numri_faneles, @pesha, @gjatesia, @statusi, @vlera_tregut)`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { emri, mbiemri, pozicioni, numri_faneles, statusi, vlera_tregut } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("emri", sql.NVarChar, emri)
      .input("mbiemri", sql.NVarChar, mbiemri)
      .input("pozicioni", sql.NVarChar, pozicioni)
      .input("numri_faneles", sql.Int, numri_faneles)
      .input("statusi", sql.NVarChar, statusi)
      .input("vlera_tregut", sql.Decimal, vlera_tregut)
      .query("UPDATE Players SET emri=@emri, mbiemri=@mbiemri, pozicioni=@pozicioni, numri_faneles=@numri_faneles, statusi=@statusi, vlera_tregut=@vlera_tregut WHERE id=@id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Players WHERE id=@id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;