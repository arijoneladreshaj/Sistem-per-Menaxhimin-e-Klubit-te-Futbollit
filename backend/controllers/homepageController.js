const { sql, poolPromise } = require("../config/db");

const DEFAULTS = [
  { field_key: "hero_eyebrow", field_value: "Sezoni 2025/26" },
  { field_key: "hero_image", field_value: "/homepage.jpg" },
  { field_key: "hero_title_1", field_value: "One Team." },
  { field_key: "hero_title_2", field_value: "One Dream." },
  {
    field_key: "hero_description",
    field_value:
      "Platforma zyrtare e Manchester United FC. Ndiqni ndeshjet, lojtarët dhe lajmet më të fundit.",
  },
  { field_key: "hero_btn", field_value: "SHIKO NDESHJET" },
  { field_key: "about_eyebrow", field_value: "ABOUT FC" },
  { field_key: "about_title_1", field_value: "Manchester United FC" },
  { field_key: "about_title_2", field_value: "Tradita e Fitores" },
  {
    field_key: "about_description",
    field_value:
      "Themeluar më 1878, Manchester United është një nga klubet me historinë më të pasur në futbollin botëror.",
  },
  { field_key: "stat1_num", field_value: "20×" },
  { field_key: "stat1_label", field_value: "Kampionë Anglie" },
  { field_key: "stat2_num", field_value: "3×" },
  { field_key: "stat2_label", field_value: "Champions League" },
  { field_key: "stat4_num", field_value: "1878" },
  { field_key: "stat4_label", field_value: "Themeluar" },
  { field_key: "stat5_num", field_value: "74,310" },
  { field_key: "stat5_label", field_value: "Kapaciteti" },
];

async function ensureTable() {
  const pool = await poolPromise;
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HomepageContent' AND xtype='U')
    CREATE TABLE HomepageContent (field_key VARCHAR(100) PRIMARY KEY, field_value NVARCHAR(MAX) NOT NULL)
  `);
  const check = await pool
    .request()
    .query("SELECT COUNT(*) AS cnt FROM HomepageContent");
  if (check.recordset[0].cnt === 0) {
    for (const row of DEFAULTS) {
      await pool
        .request()
        .input("k", sql.VarChar, row.field_key)
        .input("v", sql.NVarChar, row.field_value)
        .query(
          "INSERT INTO HomepageContent (field_key, field_value) VALUES (@k, @v)",
        );
    }
  }
}

exports.getAll = async (req, res) => {
  try {
    await ensureTable();
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT field_key, field_value FROM HomepageContent");
    const obj = {};
    result.recordset.forEach((r) => {
      obj[r.field_key] = r.field_value;
    });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("k", sql.VarChar, key)
      .input("v", sql.NVarChar, value).query(`
        IF EXISTS (SELECT 1 FROM HomepageContent WHERE field_key = @k)
          UPDATE HomepageContent SET field_value = @v WHERE field_key = @k
        ELSE
          INSERT INTO HomepageContent (field_key, field_value) VALUES (@k, @v)
      `);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("k", sql.VarChar, req.params.key)
      .query("DELETE FROM HomepageContent WHERE field_key = @k");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
