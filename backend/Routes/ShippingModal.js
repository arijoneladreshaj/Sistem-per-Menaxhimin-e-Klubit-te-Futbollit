const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

// GET shipping preferences for a user
router.get("/:userId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("user_id", sql.Int, req.params.userId)
      .query("SELECT * FROM ShippingPreferences WHERE user_id = @user_id");

    if (!result.recordset[0]) {
      return res.json({ country: "Kosovo", currency: "EUR", language: "sq" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SAVE shipping preferences for a user
router.put("/:userId", async (req, res) => {
  try {
    const { country, currency, language } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("user_id", sql.Int, req.params.userId)
      .input("country", sql.NVarChar, country)
      .input("currency", sql.NVarChar, currency)
      .input("language", sql.NVarChar, language)
      .query(`
        IF EXISTS (SELECT 1 FROM ShippingPreferences WHERE user_id = @user_id)
          UPDATE ShippingPreferences
          SET country = @country, currency = @currency, language = @language
          WHERE user_id = @user_id
        ELSE
          INSERT INTO ShippingPreferences (user_id, country, currency, language)
          VALUES (@user_id, @country, @currency, @language)
      `);

    res.json({ success: true, message: "Preferencat e dërgimit u ruajtën" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
