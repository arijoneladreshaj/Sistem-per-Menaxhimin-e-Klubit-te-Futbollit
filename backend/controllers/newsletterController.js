const { sql, poolPromise } = require("../config/db");

async function ensureTable() {
  const pool = await poolPromise;
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Newsletter' AND xtype='U')
    CREATE TABLE Newsletter (id INT IDENTITY PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, created_at DATETIME DEFAULT GETDATE())
  `);
}

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@"))
    return res.status(400).json({ message: "Email i pavlefshëm" });
  try {
    await ensureTable();
    const pool = await poolPromise;
    const exists = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM Newsletter WHERE email = @email");
    if (exists.recordset.length > 0)
      return res
        .status(409)
        .json({ message: "Ky email është regjistruar tashmë" });
    await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("INSERT INTO Newsletter (email) VALUES (@email)");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    await ensureTable();
    const pool = await poolPromise;
    const r = await pool
      .request()
      .query("SELECT * FROM Newsletter ORDER BY created_at DESC");
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
