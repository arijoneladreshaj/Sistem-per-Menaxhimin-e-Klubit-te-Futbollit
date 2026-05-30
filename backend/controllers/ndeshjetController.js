const { sql, poolPromise } = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Matches.*, Clubs.emertimi AS club_name
      FROM Matches
      INNER JOIN Clubs ON Matches.club_id = Clubs.id
      ORDER BY Matches.data_ndeshjes DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNextUpcoming = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 1 * FROM Matches
      WHERE statusi = 'Planifikuar' AND data_ndeshjes >= CAST(GETDATE() AS DATE)
      ORDER BY data_ndeshjes ASC, ora ASC
    `);
    res.json(result.recordset[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Matches WHERE id = @id");
    if (!result.recordset[0])
      return res.status(404).json({ error: "Ndeshja nuk u gjet" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
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
      season_id,
      logo_kundershtarit,
    } = req.body;

    if (!club_id || !ekipi_kundershtare || !data_ndeshjes)
      return res.status(400).json({ error: "Fushat obligative mungojnë" });

    const pool = await poolPromise;
    await pool
      .request()
      .input("club_id", sql.Int, club_id)
      .input("ekipi_kundershtare", sql.NVarChar, ekipi_kundershtare)
      .input("data_ndeshjes", sql.Date, data_ndeshjes)
      .input("ora", sql.VarChar, ora || null)
      .input("stadiumi", sql.NVarChar, stadiumi)
      .input("lloji_kompeticionit", sql.NVarChar, lloji_kompeticionit)
      .input("rezultati_shtepia", sql.TinyInt, rezultati_shtepia)
      .input("rezultati_jashte", sql.TinyInt, rezultati_jashte)
      .input("statusi", sql.NVarChar, statusi)
      .input("season_id", sql.Int, season_id)
      .input("logo_kundershtarit", sql.NVarChar, logo_kundershtarit || null)
      .query(`
        INSERT INTO Matches (club_id, ekipi_kundershtare, data_ndeshjes, ora, stadiumi, lloji_kompeticionit, rezultati_shtepia, rezultati_jashte, statusi, season_id, logo_kundershtarit)
        VALUES (@club_id, @ekipi_kundershtare, @data_ndeshjes, @ora, @stadiumi, @lloji_kompeticionit, @rezultati_shtepia, @rezultati_jashte, @statusi, @season_id, @logo_kundershtarit)
      `);

    res.json({ success: true, message: "Ndeshja u shtua me sukses" });

    try {
      const prefRes = await pool
        .request()
        .query(
          `SELECT user_id FROM UserPreferences WHERE topics LIKE '%ndeshje%'`,
        );
      for (const row of prefRes.recordset) {
        await pool
          .request()
          .input("uid", sql.Int, row.user_id)
          .input("tit", sql.NVarChar, "Ndeshje e re")
          .input("msg", sql.NVarChar, `Man United vs ${ekipi_kundershtare}`)
          .query(
            `INSERT INTO Notifications (user_id, titulli, mesazhi, is_read, created_at) VALUES (@uid, @tit, @msg, 0, GETDATE())`,
          );
      }
    } catch (notifErr) {
      console.error("[Notification ndeshje error]", notifErr.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      ekipi_kundershtare,
      data_ndeshjes,
      ora,
      stadiumi,
      lloji_kompeticionit,
      rezultati_shtepia,
      rezultati_jashte,
      statusi,
      season_id,
      logo_kundershtarit,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("ekipi_kundershtare", sql.NVarChar, ekipi_kundershtare)
      .input("data_ndeshjes", sql.Date, data_ndeshjes)
      .input("ora", sql.VarChar, ora || null)
      .input("stadiumi", sql.NVarChar, stadiumi || null)
      .input("lloji_kompeticionit", sql.NVarChar, lloji_kompeticionit)
      .input("rezultati_shtepia", sql.TinyInt, rezultati_shtepia ?? null)
      .input("rezultati_jashte", sql.TinyInt, rezultati_jashte ?? null)
      .input("statusi", sql.NVarChar, statusi)
      .input("season_id", sql.Int, season_id || null)
      .input("logo_kundershtarit", sql.NVarChar, logo_kundershtarit || null)
      .query(`
        UPDATE Matches SET
          ekipi_kundershtare=@ekipi_kundershtare, data_ndeshjes=@data_ndeshjes, ora=@ora,
          stadiumi=@stadiumi, lloji_kompeticionit=@lloji_kompeticionit,
          rezultati_shtepia=@rezultati_shtepia, rezultati_jashte=@rezultati_jashte,
          statusi=@statusi, season_id=@season_id, logo_kundershtarit=@logo_kundershtarit,
          updated_at=GETDATE()
        WHERE id=@id
      `);
    res.json({ success: true, message: "Ndeshja u përditësua" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Matches WHERE id = @id");
    res.json({ success: true, message: "Ndeshja u fshi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
