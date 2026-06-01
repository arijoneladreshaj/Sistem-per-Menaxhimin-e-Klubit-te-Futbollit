const express = require("express");
const router  = express.Router();
const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sql, poolPromise } = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// POST /api/payments/create-intent
// Krijon PaymentIntent dhe kthon clientSecret
router.post("/create-intent", verifyToken, async (req, res) => {
  try {
    const { amount, matchId, seats } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Shuma e pavlefshme" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100), // Stripe punon me cent
      currency: "eur",
      metadata: {
        user_id:  String(req.user.id),
        match_id: String(matchId || ""),
        seats:    JSON.stringify((seats || []).map(s => s.seatNumber)),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[Stripe create-intent]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/webhook
// Stripe dërgon event kur pagesa përfundon — update DB
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[Stripe webhook] Signature invalid:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const { user_id, match_id } = pi.metadata;

    try {
      const pool = await poolPromise;
      await pool.request()
        .input("stripe_payment_id", sql.NVarChar, pi.id)
        .input("user_id",           sql.Int,      Number(user_id))
        .input("match_id",          sql.Int,      Number(match_id))
        .query(`
          UPDATE Tickets
          SET payment_status    = 'Paguar',
              stripe_payment_id = @stripe_payment_id
          WHERE user_id  = @user_id
            AND match_id = @match_id
            AND payment_status = 'Në pritje'
        `);
      console.log(`[Webhook] Tickets updated for user ${user_id}, match ${match_id}`);
    } catch (dbErr) {
      console.error("[Webhook DB update]", dbErr.message);
    }
  }

  res.json({ received: true });
});

module.exports = router;
