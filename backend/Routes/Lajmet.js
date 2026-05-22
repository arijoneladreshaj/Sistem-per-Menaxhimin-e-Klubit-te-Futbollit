
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

    res.json({
      message: "Lajmi u shtua"
    });

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
