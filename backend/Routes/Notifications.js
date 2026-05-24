const express = require("express");
const router  = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/notifications/my — njoftimet e userit të kyçur
router.get("/my", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("user_id", sql.Int, req.user.id)
      .query(`
        SELECT TOP 20 id, titulli, mesazhi, is_read, created_at
        FROM Notifications
        WHERE user_id = @user_id
        ORDER BY is_read ASC, created_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("user_id", sql.Int, req.user.id)
      .query("SELECT COUNT(*) AS count FROM Notifications WHERE user_id = @user_id AND is_read = 0");
    res.json({ count: result.recordset[0].count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read — shëno si lexuar
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id",      sql.Int, req.params.id)
      .input("user_id", sql.Int, req.user.id)
      .query("UPDATE Notifications SET is_read = 1 WHERE id = @id AND user_id = @user_id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all — shëno të gjitha si lexuara
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("user_id", sql.Int, req.user.id)
      .query("UPDATE Notifications SET is_read = 1 WHERE user_id = @user_id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
