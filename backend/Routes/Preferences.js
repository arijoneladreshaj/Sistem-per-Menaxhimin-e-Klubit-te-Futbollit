const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

// GET preferences for a user
router.get("/:userId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("user_id", sql.Int, req.params.userId)
      .query("SELECT * FROM UserPreferences WHERE user_id = @user_id");

    if (!result.recordset[0]) {
      return res.json({ topics: [] });
    }

    const row = result.recordset[0];
    res.json({
      ...row,
      topics: row.topics ? JSON.parse(row.topics) : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SAVE topics for a user
router.put("/:userId", async (req, res) => {
  try {
    const { topics } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("user_id", sql.Int, req.params.userId)
      .input("topics", sql.NVarChar, topics ? JSON.stringify(topics) : null)
      .query(`
        IF EXISTS (SELECT 1 FROM UserPreferences WHERE user_id = @user_id)
          UPDATE UserPreferences
          SET topics = @topics
          WHERE user_id = @user_id
        ELSE
          INSERT INTO UserPreferences (user_id, topics)
          VALUES (@user_id, @topics)
      `);

    res.json({ success: true, message: "Preferencat u ruajtën" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
