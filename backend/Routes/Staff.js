const express = require("express");

const router = express.Router();

const { sql, poolPromise } = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, requireAdmin, async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool
      .request()
      .query(`
        SELECT * FROM Staff
        ORDER BY id DESC
      `);

    res.json(result.recordset);

  } catch (err) {

    res.status(500).json(err.message);
  }
});

router.get("/:id", verifyToken, requireAdmin, async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)

      .query(`
        SELECT * FROM Staff
        WHERE id = @id
      `);

    res.json(result.recordset[0]);

  } catch (err) {

    res.status(500).json(err.message);
  }
});


router.post("/", verifyToken, requireAdmin, async (req, res) => {

  try {

    const {
      club_id,
      user_id,
      emri,
      mbiemri,
      roli,
      specializimi,
      data_punesimit,
      statusi,
      foto
    } = req.body;

    const pool = await poolPromise;

    await pool
      .request()

      .input("club_id", sql.Int, club_id)

      .input(
        "user_id",
        sql.Int,
        user_id === "" ? null : user_id
      )

      .input("emri", sql.NVarChar, emri)

      .input("mbiemri", sql.NVarChar, mbiemri)

      .input("roli", sql.NVarChar, roli)

      .input(
        "specializimi",
        sql.NVarChar,
        specializimi
      )

      .input(
        "data_punesimit",
        sql.Date,
        data_punesimit
      )

      .input(
        "statusi",
        sql.NVarChar,
        statusi
      )

      .input(
        "foto",
        sql.NVarChar,
        foto || null
      )

      .query(`
        INSERT INTO Staff
        (
          club_id,
          user_id,
          emri,
          mbiemri,
          roli,
          specializimi,
          data_punesimit,
          statusi,
          foto
        )

        VALUES
        (
          @club_id,
          @user_id,
          @emri,
          @mbiemri,
          @roli,
          @specializimi,
          @data_punesimit,
          @statusi,
          @foto
        )
      `);

    res.json({
      message: "Staff created successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err.message);
  }
});



router.put("/:id", verifyToken, requireAdmin, async (req, res) => {

  try {

    const {
      club_id,
      user_id,
      emri,
      mbiemri,
      roli,
      specializimi,
      data_punesimit,
      statusi,
      foto
    } = req.body;

    const pool = await poolPromise;

    await pool
      .request()

      .input("id", sql.Int, req.params.id)

      .input("club_id", sql.Int, club_id)

      .input(
        "user_id",
        sql.Int,
        user_id === "" ? null : user_id
      )

      .input("emri", sql.NVarChar, emri)

      .input("mbiemri", sql.NVarChar, mbiemri)

      .input("roli", sql.NVarChar, roli)

      .input(
        "specializimi",
        sql.NVarChar,
        specializimi
      )

      .input(
        "data_punesimit",
        sql.Date,
        data_punesimit
      )

      .input(
        "statusi",
        sql.NVarChar,
        statusi
      )

      .input(
        "foto",
        sql.NVarChar,
        foto || null
      )

      .query(`
        UPDATE Staff

        SET
          club_id = @club_id,
          user_id = @user_id,
          emri = @emri,
          mbiemri = @mbiemri,
          roli = @roli,
          specializimi = @specializimi,
          data_punesimit = @data_punesimit,
          statusi = @statusi,
          foto = @foto,
          updated_at = GETDATE()

        WHERE id = @id
      `);

    res.json({
      message: "Staff updated successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err.message);
  }
});


router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {

  try {

    const pool = await poolPromise;

    await pool
      .request()

      .input("id", sql.Int, req.params.id)

      .query(`
        DELETE FROM Staff
        WHERE id = @id
      `);

    res.json({
      message: "Staff deleted successfully"
    });

  } catch (err) {

    res.status(500).json(err.message);
  }
});

module.exports = router;