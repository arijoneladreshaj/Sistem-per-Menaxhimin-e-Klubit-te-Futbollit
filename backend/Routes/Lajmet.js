
const express = require("express");

const router = express.Router();

const { sql, poolPromise } = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");


// GET ALL
router.get("/", async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool
      .request()
      .query(`
        SELECT * FROM Lajme
        ORDER BY id DESC
      `);

    res.json(result.recordset);

  } catch (err) {

    res.status(500).json(err.message);
  }
});


// POST
router.post("/", verifyToken, requireAdmin, async (req, res) => {

  try {

    const {
      titulli,
      pershkrimi,
      kategoria,
      foto,
      autori
    } = req.body;

    const pool = await poolPromise;

    await pool
      .request()

      .input("titulli", sql.NVarChar, titulli)

      .input(
        "pershkrimi",
        sql.NVarChar,
        pershkrimi
      )

      .input(
        "kategoria",
        sql.NVarChar,
        kategoria
      )

      .input(
        "foto",
        sql.NVarChar,
        foto
      )

      .input(
        "autori",
        sql.NVarChar,
        autori
      )

      .query(`
        INSERT INTO Lajme
        (
          titulli,
          pershkrimi,
          kategoria,
          foto,
          autori
        )

        VALUES
        (
          @titulli,
          @pershkrimi,
          @kategoria,
          @foto,
          @autori
        )
      `);

    res.json({ message: "Lajmi u shtua" });

    try {
      const prefRes = await pool.request()
        .query(`SELECT user_id FROM UserPreferences WHERE topics LIKE '%lajme%'`);
      console.log(`[Notification lajme] ${prefRes.recordset.length} users`);
      for (const row of prefRes.recordset) {
        await pool.request()
          .input("uid", sql.Int,      row.user_id)
          .input("tit", sql.NVarChar, "Lajm i ri")
          .input("msg", sql.NVarChar, titulli)
          .query(`INSERT INTO Notifications (user_id, titulli, mesazhi, is_read, created_at) VALUES (@uid, @tit, @msg, 0, GETDATE())`);
      }
    } catch (notifErr) {
      console.error("[Notification lajme error]", notifErr.message);
    }

  } catch (err) {

    console.log(err);

    res.status(500).json(err.message);
  }
});


// DELETE
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {

  try {

    const pool = await poolPromise;

    await pool
      .request()

      .input("id", sql.Int, req.params.id)

      .query(`
        DELETE FROM Lajme
        WHERE id = @id
      `);

    res.json({
      message: "Lajmi u fshi"
    });

  } catch (err) {

    res.status(500).json(err.message);
  }
});


// UPDATE
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {

  try {

    const {
      titulli,
      pershkrimi,
      kategoria,
      foto,
      autori
    } = req.body;

    const pool = await poolPromise;

    await pool
      .request()

      .input("id", sql.Int, req.params.id)

      .input("titulli", sql.NVarChar, titulli)

      .input(
        "pershkrimi",
        sql.NVarChar,
        pershkrimi
      )

      .input(
        "kategoria",
        sql.NVarChar,
        kategoria
      )

      .input(
        "foto",
        sql.NVarChar,
        foto
      )

      .input(
        "autori",
        sql.NVarChar,
        autori
      )

      .query(`
        UPDATE Lajme

        SET
          titulli = @titulli,
          pershkrimi = @pershkrimi,
          kategoria = @kategoria,
          foto = @foto,
          autori = @autori,
          updated_at = GETDATE()

        WHERE id = @id
      `);

    res.json({
      message: "Lajmi u editua"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err.message);
  }
});


module.exports = router;
