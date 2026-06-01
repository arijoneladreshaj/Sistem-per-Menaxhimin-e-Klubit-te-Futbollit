const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { sendStoreConfirmation } = require("../emailService");

// POST — krijo porosi
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      emri, mbiemri, email, telefoni, adresa, qyteti, shteti,
      subtotal, shipping, total, items,
      stripe_payment_id, payment_status,
    } = req.body;
    const pool = await poolPromise;

    const orderRes = await pool.request()
      .input("user_id",          sql.Int,           req.user.id)
      .input("emri",             sql.NVarChar(100),  emri)
      .input("mbiemri",          sql.NVarChar(100),  mbiemri)
      .input("email",            sql.NVarChar(100),  email)
      .input("telefoni",         sql.NVarChar(20),   telefoni)
      .input("adresa",           sql.NVarChar(200),  adresa)
      .input("qyteti",           sql.NVarChar(100),  qyteti)
      .input("shteti",           sql.NVarChar(100),  shteti)
      .input("subtotal",         sql.Decimal(10,2),  subtotal)
      .input("shipping",         sql.Decimal(10,2),  shipping)
      .input("total",            sql.Decimal(10,2),  total)
      .input("stripe_payment_id",sql.NVarChar(100),  stripe_payment_id || null)
      .input("payment_status",   sql.NVarChar(20),   payment_status    || "Në pritje")
      .query(`
        INSERT INTO Orders (user_id,emri,mbiemri,email,telefoni,adresa,qyteti,shteti,subtotal,shipping,total,stripe_payment_id,payment_status)
        OUTPUT INSERTED.id
        VALUES (@user_id,@emri,@mbiemri,@email,@telefoni,@adresa,@qyteti,@shteti,@subtotal,@shipping,@total,@stripe_payment_id,@payment_status)
      `);

    const orderId = orderRes.recordset[0].id;

    for (const item of items) {
      await pool.request()
        .input("order_id",   sql.Int,          orderId)
        .input("product_id", sql.Int,          item.id || null)
        .input("emri",       sql.NVarChar(200), item.name)
        .input("madhesia",   sql.NVarChar(20),  item.selectedSize)
        .input("sasia",      sql.Int,           item.qty)
        .input("cmimi",      sql.Decimal(10,2), item.price)
        .query(`INSERT INTO OrderItems (order_id,product_id,emri,madhesia,sasia,cmimi) VALUES (@order_id,@product_id,@emri,@madhesia,@sasia,@cmimi)`);
    }

    res.json({ success: true, orderId });

    sendStoreConfirmation({
      id: orderId, emri, mbiemri, email,
      adresa, qyteti, shteti,
      subtotal, shipping, total, items,
      stripe_payment_id: stripe_payment_id || null,
    }).catch(err => console.error("[Email store error]", err.message));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all — admin
router.get("/all", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const orders = await pool.request()
      .query(`SELECT o.*, u.email as user_email FROM Orders o LEFT JOIN Users u ON o.user_id = u.id ORDER BY o.created_at DESC`);

    for (const o of orders.recordset) {
      const items = await pool.request()
        .input("order_id", sql.Int, o.id)
        .query("SELECT * FROM OrderItems WHERE order_id=@order_id");
      o.items = items.recordset;
    }

    res.json(orders.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH status — admin
router.patch("/:id/status", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id",      sql.Int,          req.params.id)
      .input("statusi", sql.NVarChar(50),  req.body.statusi)
      .query("UPDATE Orders SET statusi=@statusi WHERE id=@id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — porositë e userit
router.get("/my", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const orders = await pool.request()
      .input("user_id", sql.Int, req.user.id)
      .query("SELECT * FROM Orders WHERE user_id=@user_id ORDER BY created_at DESC");

    for (const o of orders.recordset) {
      const items = await pool.request()
        .input("order_id", sql.Int, o.id)
        .query("SELECT * FROM OrderItems WHERE order_id=@order_id");
      o.items = items.recordset;
    }

    res.json(orders.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — porosia sipas ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const oRes = await pool.request()
      .input("id",      sql.Int, req.params.id)
      .input("user_id", sql.Int, req.user.id)
      .query("SELECT * FROM Orders WHERE id=@id AND user_id=@user_id");

    if (!oRes.recordset[0]) return res.status(404).json({ message: "Porosia nuk u gjet" });

    const order = oRes.recordset[0];
    const items = await pool.request()
      .input("order_id", sql.Int, order.id)
      .query("SELECT * FROM OrderItems WHERE order_id=@order_id");
    order.items = items.recordset;

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE — anulo porosinë (user ose admin)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const isAdmin = req.user?.role?.toLowerCase() === "admin";

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM OrderItems WHERE order_id=@id");

    if (isAdmin) {
      await pool.request()
        .input("id", sql.Int, req.params.id)
        .query("DELETE FROM Orders WHERE id=@id");
    } else {
      await pool.request()
        .input("id",      sql.Int, req.params.id)
        .input("user_id", sql.Int, req.user.id)
        .query("DELETE FROM Orders WHERE id=@id AND user_id=@user_id");
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
