const express = require("express");
const router  = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// POST — dërgo mesazh (publik)
router.post("/", async (req, res) => {
  const { emri, email, mesazhi } = req.body;
  if (!emri || !email || !mesazhi)
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme" });
  if (!email.includes("@"))
    return res.status(400).json({ message: "Email i pavlefshëm" });
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("emri",    sql.NVarChar, emri)
      .input("email",   sql.VarChar,  email)
      .input("mesazhi", sql.NVarChar, mesazhi)
      .query("INSERT INTO ContactMessages (emri, email, mesazhi) VALUES (@emri, @email, @mesazhi)");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — shiko mesazhet (admin)
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query("SELECT * FROM ContactMessages ORDER BY created_at DESC");
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /:id/lexuar — shëno si lexuar (admin)
router.put("/:id/lexuar", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("UPDATE ContactMessages SET lexuar = 1 WHERE id = @id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /:id — fshi mesazhin (admin)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM ContactMessages WHERE id = @id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
