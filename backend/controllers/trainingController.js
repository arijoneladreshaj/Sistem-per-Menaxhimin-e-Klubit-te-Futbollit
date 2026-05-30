const { sql, poolPromise } = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM TrainingSessions ORDER BY data_stervitjes DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      club_id,
      data_stervitjes,
      ora_fillimit,
      ora_perfundimit,
      lloji,
      pershkrimi,
      lokacioni,
    } = req.body;
    const pool = await poolPromise;

    await pool
      .request()
      .input("club_id", sql.Int, Number(club_id))
      .input("data_stervitjes", sql.Date, new Date(data_stervitjes))
      .input(
        "ora_fillimit",
        sql.NVarChar,
        ora_fillimit.length === 5 ? ora_fillimit + ":00" : ora_fillimit,
      )
      .input(
        "ora_perfundimit",
        sql.NVarChar,
        ora_perfundimit.length === 5
          ? ora_perfundimit + ":00"
          : ora_perfundimit,
      )
      .input("lloji", sql.NVarChar, lloji)
      .input("pershkrimi", sql.NVarChar, pershkrimi)
      .input("lokacioni", sql.NVarChar, lokacioni)
      .query(
        "INSERT INTO TrainingSessions (club_id,data_stervitjes,ora_fillimit,ora_perfundimit,lloji,pershkrimi,lokacioni) VALUES (@club_id,@data_stervitjes,@ora_fillimit,@ora_perfundimit,@lloji,@pershkrimi,@lokacioni)",
      );

    const date = new Date(data_stervitjes).toLocaleDateString("sq-AL", {
      day: "numeric",
      month: "long",
    });
    const titulli = `Stërvitje e re — ${date}`;
    const mesazhi = `${lloji || "Stërvitje"} në ${lokacioni || "lokacion TBD"}, ora ${ora_fillimit?.slice(0, 5)}${pershkrimi ? ". " + pershkrimi : ""}`;

    const lojtaret = await pool
      .request()
      .query("SELECT id FROM Users WHERE role = 'Lojtari'");
    for (const u of lojtaret.recordset) {
      await pool
        .request()
        .input("user_id", sql.Int, u.id)
        .input("titulli", sql.NVarChar, titulli)
        .input("mesazhi", sql.NVarChar, mesazhi)
        .query(
          "INSERT INTO Notifications (user_id, titulli, mesazhi, created_at) VALUES (@user_id, @titulli, @mesazhi, GETUTCDATE())",
        );
    }

    res.json({ message: "Stervitja u shtua" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      club_id,
      data_stervitjes,
      ora_fillimit,
      ora_perfundimit,
      lloji,
      pershkrimi,
      lokacioni,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, Number(req.params.id))
      .input("club_id", sql.Int, Number(club_id))
      .input("data_stervitjes", sql.Date, new Date(data_stervitjes))
      .input(
        "ora_fillimit",
        sql.NVarChar,
        ora_fillimit.length === 5 ? ora_fillimit + ":00" : ora_fillimit,
      )
      .input(
        "ora_perfundimit",
        sql.NVarChar,
        ora_perfundimit.length === 5
          ? ora_perfundimit + ":00"
          : ora_perfundimit,
      )
      .input("lloji", sql.NVarChar, lloji)
      .input("pershkrimi", sql.NVarChar, pershkrimi)
      .input("lokacioni", sql.NVarChar, lokacioni)
      .query(
        "UPDATE TrainingSessions SET club_id=@club_id,data_stervitjes=@data_stervitjes,ora_fillimit=@ora_fillimit,ora_perfundimit=@ora_perfundimit,lloji=@lloji,pershkrimi=@pershkrimi,lokacioni=@lokacioni WHERE id=@id",
      );
    res.json({ message: "Stervitja u perditesua" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM TrainingSessions WHERE id = @id");
    res.json({ message: "Stervitja u fshi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", sql.Int, req.user.id)
      .query(
        "SELECT training_id, statusi FROM TrainingAttendance WHERE user_id = @user_id",
      );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { statusi } = req.body;
    if (!["Po vij", "Nuk vij"].includes(statusi))
      return res
        .status(400)
        .json({ message: "Statusi duhet të jetë 'Po vij' ose 'Nuk vij'" });

    const pool = await poolPromise;
    await pool
      .request()
      .input("training_id", sql.Int, req.params.id)
      .input("user_id", sql.Int, req.user.id)
      .input("statusi", sql.NVarChar, statusi).query(`
        MERGE TrainingAttendance AS t
        USING (SELECT @training_id AS training_id, @user_id AS user_id) AS s
        ON t.training_id = s.training_id AND t.user_id = s.user_id
        WHEN MATCHED THEN UPDATE SET statusi = @statusi
        WHEN NOT MATCHED THEN INSERT (training_id, user_id, statusi) VALUES (@training_id, @user_id, @statusi);
      `);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("training_id", sql.Int, req.params.id).query(`
        SELECT u.id, u.emri, u.mbiemri, ISNULL(a.statusi, 'Papërcaktuar') AS statusi
        FROM Users u
        LEFT JOIN TrainingAttendance a ON a.user_id = u.id AND a.training_id = @training_id
        WHERE u.role = 'Lojtari' ORDER BY u.emri
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
