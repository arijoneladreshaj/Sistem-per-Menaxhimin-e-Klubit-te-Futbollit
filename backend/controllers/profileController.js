const bcrypt = require("bcryptjs");
const { sql, poolPromise } = require("../config/db");

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id !== req.user.id)
      return res.status(403).json({ message: "Nuk ke leje" });

    const { username, emri, mbiemri, email, datelindja } = req.body;
    const pool = await poolPromise;

    if (username) {
      const taken = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .input("id", sql.Int, id)
        .query("SELECT id FROM Users WHERE username = @username AND id <> @id");
      if (taken.recordset.length > 0)
        return res.status(409).json({ message: "Ky username është i zënë" });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("username", sql.NVarChar, username ? username.trim() : null)
      .input("emri", sql.NVarChar, emri ? emri.trim() : null)
      .input("mbiemri", sql.NVarChar, mbiemri ? mbiemri.trim() : null)
      .input("email", sql.NVarChar, email ? email.trim() : null)
      .input("datelindja", sql.NVarChar, datelindja ? datelindja.trim() : null)
      .query(`
        UPDATE Users SET
          username   = ISNULL(@username,   username),
          emri       = ISNULL(@emri,       emri),
          mbiemri    = ISNULL(@mbiemri,    mbiemri),
          email      = ISNULL(@email,      email),
          datelindja = ISNULL(@datelindja, datelindja)
        WHERE id = @id
      `);

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        "SELECT id, username, email, emri, mbiemri, datelindja, role FROM Users WHERE id = @id",
      );

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id !== req.user.id)
      return res.status(403).json({ message: "Nuk ke leje" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Të dyja fushat janë të detyrueshme" });
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({
          message: "Fjalëkalimi i ri duhet të ketë së paku 6 karaktere",
        });

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT password_hash FROM Users WHERE id = @id");

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ message: "Useri nuk u gjet" });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid)
      return res
        .status(400)
        .json({ message: "Fjalëkalimi aktual është i gabuar" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("hash", sql.NVarChar, newHash)
      .query("UPDATE Users SET password_hash = @hash WHERE id = @id");

    res.json({ success: true, message: "Fjalëkalimi u ndryshua me sukses" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id !== req.user.id)
      return res.status(403).json({ message: "Nuk ke leje" });

    const pool = await poolPromise;
    await pool
      .request()
      .input("user_id", sql.Int, id)
      .query(
        "UPDATE RefreshTokens SET is_revoked = 1 WHERE user_id = @user_id",
      );
    await pool
      .request()
      .input("user_id", sql.Int, id)
      .query("UPDATE Tickets SET user_id = NULL WHERE user_id = @user_id");
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Users WHERE id = @id");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
