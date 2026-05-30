const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

//  Merr të gjitha klubet
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM dbo.Clubs ORDER BY created_at DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Merr një klub me id
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM dbo.Clubs WHERE id = @id");
    if (!result.recordset[0]) return res.status(404).json({ error: "Klubi nuk u gjet" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Shto klub të ri
router.post("/", verifyToken, requireRole("Admin"), async (req, res) => {
  const { emertimi, qyteti, stadiumi, viti_themelimit, logo, presidenti, buxheti } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("emertimi",        sql.NVarChar(150),    emertimi)
      .input("qyteti",          sql.NVarChar(100),    qyteti)
      .input("stadiumi",        sql.NVarChar(150),    stadiumi)
      .input("viti_themelimit", sql.SmallInt,         viti_themelimit)
      .input("logo",            sql.NVarChar(255),    logo)
      .input("presidenti",      sql.NVarChar(150),    presidenti)
      .input("buxheti",         sql.Decimal(15, 2),   buxheti)
      .query(`
        INSERT INTO dbo.Clubs (emertimi, qyteti, stadiumi, viti_themelimit, logo, presidenti, buxheti, created_at, updated_at)
        VALUES (@emertimi, @qyteti, @stadiumi, @viti_themelimit, @logo, @presidenti, @buxheti, GETDATE(), GETDATE())
      `);
    res.status(201).json({ message: "Klubi u shtua me sukses" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Ndrysho klub
router.put("/:id", verifyToken, requireRole("Admin"), async (req, res) => {
  const { emertimi, qyteti, stadiumi, viti_themelimit, logo, presidenti, buxheti } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id",              sql.Int,              req.params.id)
      .input("emertimi",        sql.NVarChar(150),    emertimi)
      .input("qyteti",          sql.NVarChar(100),    qyteti)
      .input("stadiumi",        sql.NVarChar(150),    stadiumi)
      .input("viti_themelimit", sql.SmallInt,         viti_themelimit)
      .input("logo",            sql.NVarChar(255),    logo)
      .input("presidenti",      sql.NVarChar(150),    presidenti)
      .input("buxheti",         sql.Decimal(15, 2),   buxheti)
      .query(`
        UPDATE dbo.Clubs SET
          emertimi        = @emertimi,
          qyteti          = @qyteti,
          stadiumi        = @stadiumi,
          viti_themelimit = @viti_themelimit,
          logo            = @logo,
          presidenti      = @presidenti,
          buxheti         = @buxheti,
          updated_at      = GETDATE()
        WHERE id = @id
      `);
    res.json({ message: "Klubi u ndryshua me sukses" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Fshij klub
router.delete("/:id", verifyToken, requireRole("Admin"), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM dbo.Clubs WHERE id = @id");
    res.json({ message: "Klubi u fshi me sukses" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;