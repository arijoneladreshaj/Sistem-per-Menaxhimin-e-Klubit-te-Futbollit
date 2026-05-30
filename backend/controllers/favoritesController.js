const { sql, poolPromise } = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", sql.Int, req.user.id)
      .query("SELECT product_id FROM Favorites WHERE user_id = @user_id");
    res.json(result.recordset.map((r) => r.product_id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("user_id", sql.Int, req.user.id)
      .input("product_id", sql.Int, req.params.product_id)
      .query(
        "IF NOT EXISTS (SELECT 1 FROM Favorites WHERE user_id=@user_id AND product_id=@product_id) INSERT INTO Favorites (user_id, product_id) VALUES (@user_id, @product_id)",
      );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("user_id", sql.Int, req.user.id)
      .input("product_id", sql.Int, req.params.product_id)
      .query(
        "DELETE FROM Favorites WHERE user_id=@user_id AND product_id=@product_id",
      );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
