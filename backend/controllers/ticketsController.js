const { sql, poolPromise } = require("../config/db");
const MENAXHER_ROLES = ["Admin", "Menaxher"];

exports.getBooked = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("match_id", sql.Int, req.params.matchId)
      .input("sektori", sql.NVarChar, req.params.sektori)
      .query(
        "SELECT numri_uleses FROM Tickets WHERE match_id=@match_id AND sektori=@sektori AND statusi IN ('E rezervuar','E shitur')",
      );
    res.json(result.recordset.map((r) => r.numri_uleses));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMy = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("user_id", sql.Int, req.user.id)
      .query(`
        SELECT t.*, m.ekipi_kundershtare, m.data_ndeshjes, m.stadiumi
        FROM Tickets t LEFT JOIN Matches m ON t.match_id = m.id
        WHERE t.user_id = @user_id ORDER BY t.created_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT t.*, m.ekipi_kundershtare, m.data_ndeshjes, m.stadiumi,
             u.emri AS user_emri, u.mbiemri AS user_mbiemri, u.email AS user_email
      FROM Tickets t
      LEFT JOIN Matches m ON t.match_id = m.id
      LEFT JOIN Users   u ON t.user_id  = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByMatch = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("match_id", sql.Int, req.params.matchId).query(`
        SELECT t.*, u.emri AS user_emri, u.mbiemri AS user_mbiemri
        FROM Tickets t LEFT JOIN Users u ON t.user_id = u.id
        WHERE t.match_id = @match_id ORDER BY t.sektori, t.numri_uleses
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { match_id, seats } = req.body;
    const user_id = req.user.id;
    if (!match_id || !seats || seats.length === 0)
      return res.status(400).json({ error: "Të dhënat mungojnë" });

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      for (const seat of seats) {
        const sectorId   = seat.sectorId || seat.sectorName;
        const seatNumber = seat.seatNumber;

        // Kontroll atomik: kyç rreshtin para INSERT për të parandaluar double-booking
        const checkReq = new sql.Request(transaction);
        const existing = await checkReq
          .input("match_id",      sql.Int,      match_id)
          .input("sektori",       sql.NVarChar, sectorId)
          .input("numri_uleses",  sql.Int,      seatNumber)
          .query(`
            SELECT id FROM Tickets WITH (UPDLOCK, HOLDLOCK)
            WHERE match_id = @match_id AND sektori = @sektori AND numri_uleses = @numri_uleses
              AND statusi IN ('E rezervuar', 'E shitur')
          `);

        if (existing.recordset.length > 0)
          throw Object.assign(
            new Error(`Ulësja ${seatNumber} në sektorin ${sectorId} është tashmë e zënë`),
            { conflict: true }
          );

        const insertReq = new sql.Request(transaction);
        await insertReq
          .input("match_id",          sql.Int,      match_id)
          .input("user_id",           sql.Int,      user_id)
          .input("sektori",           sql.NVarChar, sectorId)
          .input("numri_uleses",      sql.Int,      seatNumber)
          .input("emri_bleresit",     sql.NVarChar, seat.firstName || null)
          .input("mbiemri_bleresit",  sql.NVarChar, seat.lastName  || null)
          .input("cmimi",             sql.Decimal,  seat.price)
          .input("is_vip",            sql.Bit,      seat.isVip ? 1 : 0)
          .input("statusi",           sql.NVarChar, seat.statusi || "E shitur")
          .query(
            "INSERT INTO Tickets (match_id,user_id,sektori,numri_uleses,emri_bleresit,mbiemri_bleresit,cmimi,is_vip,statusi) VALUES (@match_id,@user_id,@sektori,@numri_uleses,@emri_bleresit,@mbiemri_bleresit,@cmimi,@is_vip,@statusi)"
          );
      }

      await transaction.commit();
    } catch (txErr) {
      await transaction.rollback();
      if (txErr.conflict) return res.status(409).json({ error: txErr.message });
      throw txErr;
    }

    const orderRef = Math.floor(100000 + Math.random() * 900000);
    res.json({ success: true, message: "Biletat u ruajtën me sukses", orderRef });

    const isAdmin = MENAXHER_ROLES.map((r) => r.toLowerCase()).includes(
      req.user.role?.toLowerCase(),
    );
    if (isAdmin) {
      try {
        const matchRes = await pool
          .request()
          .input("mid", sql.Int, match_id)
          .query("SELECT ekipi_kundershtare FROM Matches WHERE id = @mid");
        const kundershtari =
          matchRes.recordset[0]?.ekipi_kundershtare || "kundërshtari";
        const prefRes = await pool
          .request()
          .query(`SELECT user_id FROM UserPreferences WHERE topics LIKE '%bileta%'`);
        for (const row of prefRes.recordset) {
          await pool
            .request()
            .input("uid", sql.Int, row.user_id)
            .input("tit", sql.NVarChar, "Bileta të reja")
            .input("msg", sql.NVarChar, `Bileta disponueshme për Man United vs ${kundershtari}`)
            .query(
              `INSERT INTO Notifications (user_id, titulli, mesazhi, is_read, created_at) VALUES (@uid, @tit, @msg, 0, GETUTCDATE())`
            );
        }
      } catch (notifErr) {
        console.error("[Notification bileta error]", notifErr.message);
      }
    }
  } catch (err) {
    console.error("[tickets.create]", err);
    res.status(500).json({ error: "Gabim intern i serverit" });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      statusi,
      sektori,
      numri_uleses,
      emri_bleresit,
      mbiemri_bleresit,
      cmimi,
      is_vip,
      match_id,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("statusi", sql.NVarChar, statusi || null)
      .input("sektori", sql.NVarChar, sektori || null)
      .input("numri_uleses", sql.Int, numri_uleses || null)
      .input("emri_bleresit", sql.NVarChar, emri_bleresit || null)
      .input("mbiemri_bleresit", sql.NVarChar, mbiemri_bleresit || null)
      .input("cmimi", sql.Decimal, cmimi || null)
      .input("is_vip", sql.Bit, is_vip ? 1 : 0)
      .input("match_id", sql.Int, match_id || null).query(`
        UPDATE Tickets SET
          statusi=COALESCE(@statusi,statusi), sektori=COALESCE(@sektori,sektori),
          numri_uleses=COALESCE(@numri_uleses,numri_uleses), emri_bleresit=COALESCE(@emri_bleresit,emri_bleresit),
          mbiemri_bleresit=COALESCE(@mbiemri_bleresit,mbiemri_bleresit), cmimi=COALESCE(@cmimi,cmimi),
          is_vip=@is_vip, match_id=COALESCE(@match_id,match_id)
        WHERE id=@id
      `);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const pool = await poolPromise;
    const isStaff = MENAXHER_ROLES.map((r) => r.toLowerCase()).includes(
      req.user?.role?.toLowerCase(),
    );
    if (!isStaff) {
      const check = await pool
        .request()
        .input("id", sql.Int, req.params.id)
        .input("user_id", sql.Int, req.user.id)
        .query("SELECT id FROM Tickets WHERE id=@id AND user_id=@user_id");
      if (!check.recordset[0])
        return res.status(403).json({ error: "Nuk ke leje" });
    }
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Tickets WHERE id=@id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
