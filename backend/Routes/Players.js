const express = require("express");
const router  = express.Router();
const path    = require("path");
const fs      = require("fs");
const multer  = require("multer");
const { sql, poolPromise } = require("../db");

const UPLOAD_DIR = path.join(__dirname, "../../public/players");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:    (_, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `upload-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Vetëm imazhe lejohen"));
  },
});

const POZICIONET_VALID = ["Portier", "Mbrojtës", "Mesfushor", "Sulmues"];
const STATUSET_VALID   = ["Aktiv", "Lenduar", "I transferuar", "I pensionuar"];

// GET all
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        p.*,
        c.emertimi AS club_name
      FROM Players p
      LEFT JOIN Clubs c ON p.club_id = c.id
      ORDER BY p.mbiemri, p.emri
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT
          p.*,
          c.emertimi AS club_name
        FROM Players p
        LEFT JOIN Clubs c ON p.club_id = c.id
        WHERE p.id = @id
      `);
    if (!result.recordset[0])
      return res.status(404).json({ error: "Lojtari nuk u gjet" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post("/", async (req, res) => {
  try {
    const {
      club_id, emri, mbiemri, data_lindjes, kombesia,
      pozicioni, numri_faneles, pesha, gjatesia, statusi, vlera_tregut
    } = req.body;

    if (!emri || !mbiemri || !pozicioni)
      return res.status(400).json({ error: "Emri, mbiemri dhe pozicioni janë të detyrueshme" });

    if (!POZICIONET_VALID.includes(pozicioni))
      return res.status(400).json({ error: `Pozicioni duhet të jetë: ${POZICIONET_VALID.join(", ")}` });

    if (statusi && !STATUSET_VALID.includes(statusi))
      return res.status(400).json({ error: `Statusi duhet të jetë: ${STATUSET_VALID.join(", ")}` });

    const pool = await poolPromise;
    const result = await pool.request()
      .input("club_id",       sql.Int,          club_id || 1)
      .input("emri",          sql.NVarChar(100), emri)
      .input("mbiemri",       sql.NVarChar(100), mbiemri)
      .input("data_lindjes",  sql.Date,          data_lindjes || null)
      .input("kombesia",      sql.NVarChar(100), kombesia || null)
      .input("pozicioni",     sql.NVarChar(20),  pozicioni)
      .input("numri_faneles", sql.TinyInt,       numri_faneles || null)
      .input("pesha",         sql.Decimal(5, 2), pesha || null)
      .input("gjatesia",      sql.Decimal(5, 2), gjatesia || null)
      .input("statusi",       sql.NVarChar(20),  statusi || "Aktiv")
      .input("vlera_tregut",  sql.Decimal(15, 2),vlera_tregut || 0)
      .query(`
        INSERT INTO Players
          (club_id, emri, mbiemri, data_lindjes, kombesia,
           pozicioni, numri_faneles, pesha, gjatesia, statusi, vlera_tregut)
        OUTPUT INSERTED.id
        VALUES
          (@club_id, @emri, @mbiemri, @data_lindjes, @kombesia,
           @pozicioni, @numri_faneles, @pesha, @gjatesia, @statusi, @vlera_tregut)
      `);
    const newId = result.recordset[0].id;
    res.status(201).json({ success: true, message: "Lojtari u shtua", id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put("/:id", async (req, res) => {
  try {
    const {
      emri, mbiemri, data_lindjes, kombesia,
      pozicioni, numri_faneles, pesha, gjatesia, statusi, vlera_tregut
    } = req.body;

    if (pozicioni && !POZICIONET_VALID.includes(pozicioni))
      return res.status(400).json({ error: `Pozicioni duhet të jetë: ${POZICIONET_VALID.join(", ")}` });

    if (statusi && !STATUSET_VALID.includes(statusi))
      return res.status(400).json({ error: `Statusi duhet të jetë: ${STATUSET_VALID.join(", ")}` });

    const pool = await poolPromise;
    await pool.request()
      .input("id",            sql.Int,           req.params.id)
      .input("emri",          sql.NVarChar(100),  emri)
      .input("mbiemri",       sql.NVarChar(100),  mbiemri)
      .input("data_lindjes",  sql.Date,           data_lindjes || null)
      .input("kombesia",      sql.NVarChar(100),  kombesia || null)
      .input("pozicioni",     sql.NVarChar(20),   pozicioni)
      .input("numri_faneles", sql.TinyInt,        numri_faneles || null)
      .input("pesha",         sql.Decimal(5, 2),  pesha || null)
      .input("gjatesia",      sql.Decimal(5, 2),  gjatesia || null)
      .input("statusi",       sql.NVarChar(20),   statusi)
      .input("vlera_tregut",  sql.Decimal(15, 2), vlera_tregut || 0)
      .query(`
        UPDATE Players SET
          emri          = @emri,
          mbiemri       = @mbiemri,
          data_lindjes  = @data_lindjes,
          kombesia      = @kombesia,
          pozicioni     = @pozicioni,
          numri_faneles = @numri_faneles,
          pesha         = @pesha,
          gjatesia      = @gjatesia,
          statusi       = @statusi,
          vlera_tregut  = @vlera_tregut,
          updated_at    = GETDATE()
        WHERE id = @id
      `);
    res.json({ success: true, message: "Lojtari u përditësua" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST photo upload
router.post("/:id/photo", upload.single("foto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nuk u dërgua asnjë file" });

    const fotoUrl = `/players/${req.file.filename}`;
    const pool = await poolPromise;

    // delete old uploaded photo (not static ones)
    const old = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT foto_url FROM Players WHERE id = @id");
    const oldUrl = old.recordset[0]?.foto_url;
    if (oldUrl && oldUrl.includes("upload-")) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(oldUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.request()
      .input("id",       sql.Int,           req.params.id)
      .input("foto_url", sql.NVarChar(255),  fotoUrl)
      .query("UPDATE Players SET foto_url = @foto_url WHERE id = @id");

    res.json({ success: true, foto_url: fotoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE photo
router.delete("/:id/photo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const row = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT foto_url FROM Players WHERE id = @id");
    const url = row.recordset[0]?.foto_url;
    if (url && url.includes("upload-")) {
      const filePath = path.join(UPLOAD_DIR, path.basename(url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("UPDATE Players SET foto_url = NULL WHERE id = @id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Players WHERE id = @id");
    res.json({ success: true, message: "Lojtari u fshi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
