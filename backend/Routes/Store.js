const express = require("express");

const router = express.Router();

const { sql, poolPromise } = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const MENAXHER_ROLES = ["Admin", "Menaxher"];

router.get("/", async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool
      .request()
      .query(`
        SELECT * FROM Products
        ORDER BY id DESC
      `);

    res.json(result.recordset);

  } catch (err) {

    res.status(500).json(err.message);
  }
});

router.get("/:id", async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)

      .query(`
        SELECT * FROM Products
        WHERE id = @id
      `);

    res.json(result.recordset[0]);

  } catch (err) {

    res.status(500).json(err.message);
  }
});

router.post("/", verifyToken, requireRole(...MENAXHER_ROLES), async (req, res) => {

  try {

    const {
      name,
      category,
      subcategory,
      price,
      oldPrice,
      badge,
      imageUrl,
      sizes
    } = req.body;

    const pool = await poolPromise;

    await pool
      .request()

      .input("name", sql.NVarChar(150), name)

      .input("category", sql.NVarChar(100), category)

      .input("subcategory", sql.NVarChar(100), subcategory)

      .input("price", sql.Decimal(10, 2), price)

      .input(
        "oldPrice",
        sql.Decimal(10, 2),
        oldPrice || null
      )

      .input(
        "badge",
        sql.NVarChar(50),
        badge || null
      )

      .input(
        "imageUrl",
        sql.NVarChar(sql.MAX),
        imageUrl || null
      )

      .input(
        "sizes",
        sql.NVarChar(200),
        sizes || null
      )

      .query(`
        INSERT INTO Products
        (
          name,
          category,
          subcategory,
          price,
          oldPrice,
          badge,
          imageUrl,
          sizes
        )

        VALUES
        (
          @name,
          @category,
          @subcategory,
          @price,
          @oldPrice,
          @badge,
          @imageUrl,
          @sizes
        )
      `);

    // Notification për "store"
    const prefRes = await pool.request()
      .query(`SELECT user_id FROM UserPreferences WHERE topics LIKE '%store%'`);
    for (const row of prefRes.recordset) {
      await pool.request()
        .input("uid", sql.Int,      row.user_id)
        .input("tit", sql.NVarChar, "Produkt i ri në Store")
        .input("msg", sql.NVarChar, `${name} u shtua në dyqan`)
        .query(`INSERT INTO Notifications (user_id, titulli, mesazhi) VALUES (@uid, @tit, @msg)`);
    }

    res.json({ message: "Product created successfully" });

  } catch (err) {

    console.log(err);

    res.status(500).json(err.message);
  }
});

router.put("/:id", verifyToken, requireRole(...MENAXHER_ROLES), async (req, res) => {

  try {

    const {
      name,
      category,
      subcategory,
      price,
      oldPrice,
      badge,
      imageUrl,
      sizes
    } = req.body;

    const pool = await poolPromise;

    await pool
      .request()

      .input("id", sql.Int, req.params.id)

      .input("name", sql.NVarChar(150), name)

      .input("category", sql.NVarChar(100), category)

      .input("subcategory", sql.NVarChar(100), subcategory)

      .input("price", sql.Decimal(10, 2), price)

      .input(
        "oldPrice",
        sql.Decimal(10, 2),
        oldPrice || null
      )

      .input(
        "badge",
        sql.NVarChar(50),
        badge || null
      )

      .input(
        "imageUrl",
        sql.NVarChar(sql.MAX),
        imageUrl || null
      )

      .input(
        "sizes",
        sql.NVarChar(200),
        sizes || null
      )

      .query(`
        UPDATE Products

        SET
          name = @name,
          category = @category,
          subcategory = @subcategory,
          price = @price,
          oldPrice = @oldPrice,
          badge = @badge,
          imageUrl = @imageUrl,
          sizes = @sizes

        WHERE id = @id
      `);

    res.json({
      message: "Product updated successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err.message);
  }
});

router.delete("/:id", verifyToken, requireRole(...MENAXHER_ROLES), async (req, res) => {

  try {

    const pool = await poolPromise;

    await pool
      .request()

      .input("id", sql.Int, req.params.id)

      .query(`
        DELETE FROM Products
        WHERE id = @id
      `);

    res.json({
      message: "Product deleted successfully"
    });

  } catch (err) {

    res.status(500).json(err.message);
  }
});

module.exports = router;
