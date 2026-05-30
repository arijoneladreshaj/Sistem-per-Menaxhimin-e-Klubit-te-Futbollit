const { sql, poolPromise } = require("../config/db");

exports.getMy = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", sql.Int, req.user.id)
      .query(
        "SELECT TOP 20 id, titulli, mesazhi, is_read, created_at FROM Notifications WHERE user_id = @user_id ORDER BY is_read ASC, created_at DESC",
      );
    res.json(
      result.recordset.map((n) => ({
        ...n,
        created_at: n.created_at ? new Date(n.created_at).toISOString() : null,
      })),
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", sql.Int, req.user.id)
      .query(
        "SELECT COUNT(*) AS count FROM Notifications WHERE user_id = @user_id AND is_read = 0",
      );
    res.json({ count: result.recordset[0].count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("user_id", sql.Int, req.user.id)
      .query(
        "UPDATE Notifications SET is_read = 1 WHERE id = @id AND user_id = @user_id",
      );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("user_id", sql.Int, req.user.id)
      .query("UPDATE Notifications SET is_read = 1 WHERE user_id = @user_id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
