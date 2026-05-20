const express = require("express");

const router = express.Router();

const { sql, poolPromise } = require("../db");


// GET all trainings
router.get("/", async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT *
      FROM TrainingSessions
      ORDER BY data_stervitjes DESC
    `);

    res.json(result.recordset);

  } catch (err) {

    console.log("SQL ERROR:");
    console.log(err);

    return res.status(500).json({
      message: err.message
    });

  }

});


// CREATE training
router.post("/", async (req, res) => {

  try {

    const {
      club_id,
      data_stervitjes,
      ora_fillimit,
      ora_perfundimit,
      lloji,
      pershkrimi,
      lokacioni
    } = req.body;

    const pool = await poolPromise;

    await pool.request()

      .input(
        "club_id",
        sql.Int,
        Number(club_id)
      )

      .input(
        "data_stervitjes",
        sql.Date,
        new Date(data_stervitjes)
      )

    .input(
  "ora_fillimit",
  sql.NVarChar,
  ora_fillimit.length === 5
    ? ora_fillimit + ":00"
    : ora_fillimit
)

.input(
  "ora_perfundimit",
  sql.NVarChar,
  ora_perfundimit.length === 5
    ? ora_perfundimit + ":00"
    : ora_perfundimit
)

      .input(
        "lloji",
        sql.NVarChar,
        lloji
      )

      .input(
        "pershkrimi",
        sql.NVarChar,
        pershkrimi
      )

      .input(
        "lokacioni",
        sql.NVarChar,
        lokacioni
      )

      .query(`
        INSERT INTO TrainingSessions
        (
          club_id,
          data_stervitjes,
          ora_fillimit,
          ora_perfundimit,
          lloji,
          pershkrimi,
          lokacioni
        )
        VALUES
        (
          @club_id,
          @data_stervitjes,
          @ora_fillimit,
          @ora_perfundimit,
          @lloji,
          @pershkrimi,
          @lokacioni
        )
      `);

    res.json({
      message: "Stervitja u shtua"
    });

  } catch (err) {

    console.log("SQL ERROR:");
    console.log(err);

    return res.status(500).json({
      message: err.message
    });

  }

});


// UPDATE training
router.put("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const {
      club_id,
      data_stervitjes,
      ora_fillimit,
      ora_perfundimit,
      lloji,
      pershkrimi,
      lokacioni
    } = req.body;

    const pool = await poolPromise;

    await pool.request()

      .input("id", sql.Int, Number(id))
      .input(
        "club_id",
        sql.Int,
        Number(club_id)
      )

      .input(
        "data_stervitjes",
        sql.Date,
        new Date(data_stervitjes)
      )

      .input(
        "ora_fillimit",
        sql.NVarChar,
        ora_fillimit.length === 5 ? ora_fillimit + ":00" : ora_fillimit
      )

      .input(
        "ora_perfundimit",
        sql.NVarChar,
        ora_perfundimit.length === 5 ? ora_perfundimit + ":00" : ora_perfundimit
      )

      .input(
        "lloji",
        sql.NVarChar,
        lloji
      )

      .input(
        "pershkrimi",
        sql.NVarChar,
        pershkrimi
      )

      .input(
        "lokacioni",
        sql.NVarChar,
        lokacioni
      )

      .query(`
        UPDATE TrainingSessions
        SET
          club_id = @club_id,
          data_stervitjes = @data_stervitjes,
          ora_fillimit = @ora_fillimit,
          ora_perfundimit = @ora_perfundimit,
          lloji = @lloji,
          pershkrimi = @pershkrimi,
          lokacioni = @lokacioni
        WHERE id = @id
      `);

    res.json({
      message: "Stervitja u perditesua"
    });

  } catch (err) {

    console.log("SQL ERROR:");
    console.log(err);

    return res.status(500).json({
      message: err.message
    });

  }

});


// DELETE training
router.delete("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM TrainingSessions
        WHERE id = @id
      `);

    res.json({
      message: "Stervitja u fshi"
    });

  } catch (err) {

    console.log("SQL ERROR:");
    console.log(err);

    return res.status(500).json({
      message: err.message
    });

  }

});

module.exports = router;