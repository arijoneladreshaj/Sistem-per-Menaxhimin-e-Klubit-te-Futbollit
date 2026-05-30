const { sql, poolPromise } = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM Products ORDER BY id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Products WHERE id = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      price,
      oldPrice,
      badge,
      imageUrl,
      sizes,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("name", sql.NVarChar(150), name)
      .input("category", sql.NVarChar(100), category)
      .input("subcategory", sql.NVarChar(100), subcategory)
      .input("price", sql.Decimal(10, 2), price)
      .input("oldPrice", sql.Decimal(10, 2), oldPrice || null)
      .input("badge", sql.NVarChar(50), badge || null)
      .input("imageUrl", sql.NVarChar(sql.MAX), imageUrl || null)
      .input("sizes", sql.NVarChar(200), sizes || null)
      .query(
        "INSERT INTO Products (name,category,subcategory,price,oldPrice,badge,imageUrl,sizes) VALUES (@name,@category,@subcategory,@price,@oldPrice,@badge,@imageUrl,@sizes)",
      );

    res.json({ message: "Product created successfully" });

    try {
      const prefRes = await pool
        .request()
        .query(
          `SELECT user_id FROM UserPreferences WHERE topics LIKE '%store%'`,
        );
      for (const row of prefRes.recordset) {
        await pool
          .request()
          .input("uid", sql.Int, row.user_id)
          .input("tit", sql.NVarChar, "Produkt i ri në Store")
          .input("msg", sql.NVarChar, `${name} u shtua në dyqan`)
          .query(
            `INSERT INTO Notifications (user_id, titulli, mesazhi, is_read, created_at) VALUES (@uid, @tit, @msg, 0, GETDATE())`,
          );
      }
    } catch (notifErr) {
      console.error("[Notification store error]", notifErr.message);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      price,
      oldPrice,
      badge,
      imageUrl,
      sizes,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("name", sql.NVarChar(150), name)
      .input("category", sql.NVarChar(100), category)
      .input("subcategory", sql.NVarChar(100), subcategory)
      .input("price", sql.Decimal(10, 2), price)
      .input("oldPrice", sql.Decimal(10, 2), oldPrice || null)
      .input("badge", sql.NVarChar(50), badge || null)
      .input("imageUrl", sql.NVarChar(sql.MAX), imageUrl || null)
      .input("sizes", sql.NVarChar(200), sizes || null)
      .query(
        "UPDATE Products SET name=@name,category=@category,subcategory=@subcategory,price=@price,oldPrice=@oldPrice,badge=@badge,imageUrl=@imageUrl,sizes=@sizes WHERE id=@id",
      );
    res.json({ message: "Product updated successfully" });
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
      .query("DELETE FROM Products WHERE id = @id");
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
