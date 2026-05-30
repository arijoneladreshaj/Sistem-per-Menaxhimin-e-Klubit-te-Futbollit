const { sql, poolPromise } = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT t.*, p.emri + ' ' + p.mbiemri AS emri_lojtarit, p.pozicioni, p.numri_faneles
      FROM Transfers t INNER JOIN Players p ON t.player_id = p.id
      ORDER BY t.data_transferimit DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(
        "SELECT t.*, p.emri + ' ' + p.mbiemri AS emri_lojtarit FROM Transfers t INNER JOIN Players p ON t.player_id = p.id WHERE t.id = @id",
      );
    if (!result.recordset[0])
      return res.status(404).json({ error: "Transferimi nuk u gjet" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      player_id,
      klubi_nisjes,
      klubi_destinacionit,
      shuma,
      data_transferimit,
      lloji,
      statusi,
      shenimet,
    } = req.body;
    if (!player_id || !data_transferimit)
      return res
        .status(400)
        .json({ error: "Lojtari dhe data janë të detyrueshme" });

    const pool = await poolPromise;
    await pool
      .request()
      .input("player_id", sql.Int, player_id)
      .input("klubi_nisjes", sql.NVarChar(100), klubi_nisjes || null)
      .input(
        "klubi_destinacionit",
        sql.NVarChar(100),
        klubi_destinacionit || null,
      )
      .input("shuma", sql.Decimal(15, 2), shuma || null)
      .input("data_transferimit", sql.Date, data_transferimit)
      .input("lloji", sql.NVarChar(20), lloji || "Blerje")
      .input("statusi", sql.NVarChar(20), statusi || "Konfirmuar")
      .input("shenimet", sql.NVarChar(500), shenimet || null)
      .query(
        "INSERT INTO Transfers (player_id,klubi_nisjes,klubi_destinacionit,shuma,data_transferimit,lloji,statusi,shenimet) VALUES (@player_id,@klubi_nisjes,@klubi_destinacionit,@shuma,@data_transferimit,@lloji,@statusi,@shenimet)",
      );
    res.status(201).json({ success: true, message: "Transferimi u shtua" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      player_id,
      klubi_nisjes,
      klubi_destinacionit,
      shuma,
      data_transferimit,
      lloji,
      statusi,
      shenimet,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("player_id", sql.Int, player_id)
      .input("klubi_nisjes", sql.NVarChar(100), klubi_nisjes || null)
      .input(
        "klubi_destinacionit",
        sql.NVarChar(100),
        klubi_destinacionit || null,
      )
      .input("shuma", sql.Decimal(15, 2), shuma || null)
      .input("data_transferimit", sql.Date, data_transferimit)
      .input("lloji", sql.NVarChar(20), lloji)
      .input("statusi", sql.NVarChar(20), statusi)
      .input("shenimet", sql.NVarChar(500), shenimet || null)
      .query(
        "UPDATE Transfers SET player_id=@player_id,klubi_nisjes=@klubi_nisjes,klubi_destinacionit=@klubi_destinacionit,shuma=@shuma,data_transferimit=@data_transferimit,lloji=@lloji,statusi=@statusi,shenimet=@shenimet WHERE id=@id",
      );
    res.json({ success: true, message: "Transferimi u përditësua" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Transfers WHERE id = @id");
    res.json({ success: true, message: "Transferimi u fshi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
