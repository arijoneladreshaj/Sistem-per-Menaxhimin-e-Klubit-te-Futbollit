import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../../Context/CartContext";
import api from "../../api/axiosInstance";
import "./PaymentPage.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_STYLE = {
  style: {
    base: {
      color: "#fff",
      fontFamily: "'Barlow', sans-serif",
      fontSize: "15px",
      fontWeight: "600",
      "::placeholder": { color: "rgba(255,255,255,0.35)" },
      iconColor: "#cc0000",
    },
    invalid: { color: "#ff4444", iconColor: "#ff4444" },
  },
};

function CheckoutForm({ clientSecret, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else if (result.paymentIntent.status === "succeeded") {
      onSuccess(result.paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pp-form">
      <div className="pp-card-wrap">
        <label className="pp-label">Detajet e Kartës</label>
        <div className="pp-card-element">
          <CardElement options={CARD_STYLE} />
        </div>
        <p className="pp-test-hint">
          Karta test: <strong>4242 4242 4242 4242</strong> · Çdo datë e ardhshme · Çdo CVC
        </p>
      </div>

      {error && <div className="pp-error"><i className="bi bi-exclamation-circle" /> {error}</div>}

      <button type="submit" className="pp-pay-btn" disabled={!stripe || loading}>
        {loading ? (
          <><span className="pp-spinner" /> Duke procesuar...</>
        ) : (
          <><i className="bi bi-lock-fill" /> Paguaj Tani</>
        )}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cart.length === 0) { navigate("/CartPage"); return; }

    api.post("/api/payments/create-intent", {
      amount:  total,
      matchId: cart[0]?.matchId,
      seats:   cart,
    })
      .then(res => setClientSecret(res.data.clientSecret))
      .catch(() => setClientSecret(""))
      .finally(() => setLoadingIntent(false));
  }, []);

  const handleSuccess = async (paymentIntentId) => {
    setSaving(true);
    const matchId = cart[0]?.matchId;

    const order = {
      id:        paymentIntentId.slice(-8).toUpperCase(),
      date:      new Date().toLocaleDateString("sq-AL"),
      time:      new Date().toLocaleTimeString("sq-AL"),
      seats:     cart,
      total,
      paymentId: paymentIntentId,
      paid:      true,
    };

    // Ruaj biletat në DB me status "Paguar"
    if (matchId) {
      await api.post("/api/tickets", {
        match_id:         Number(matchId),
        seats:            cart,
        payment_status:   "Paguar",
        stripe_payment_id: paymentIntentId,
      }).catch(err => console.error("Gabim tickets:", err));
    }

    clearCart();
    navigate("/ConfirmationPage", { state: { order } });
  };

  const grouped = cart.reduce((acc, seat) => {
    if (!acc[seat.sectorName]) acc[seat.sectorName] = [];
    acc[seat.sectorName].push(seat);
    return acc;
  }, {});

  return (
    <div className="pp-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            {/* Header */}
            <div className="pp-header">
              <button className="pp-back" onClick={() => navigate("/CartPage")}>← Kthehu</button>
              <h1 className="pp-title">Pagesa e Sigurt</h1>
            </div>

            <div className="row g-4">
              {/* LEFT — Stripe form */}
              <div className="col-lg-7">
                <div className="pp-box">
                  <div className="pp-box-title">
                    <i className="bi bi-credit-card-fill" /> Informacioni i Pagesës
                  </div>

                  {/* Secure badges */}
                  <div className="pp-secure-row">
                    <span className="pp-badge"><i className="bi bi-shield-lock-fill" /> SSL E Sigurt</span>
                    <span className="pp-badge"><i className="bi bi-stripe" /> Powered by Stripe</span>
                    <span className="pp-badge"><i className="bi bi-bank" /> PCI DSS</span>
                  </div>

                  {loadingIntent ? (
                    <div className="pp-loading">Duke ngarkuar formularin e pagesës...</div>
                  ) : !clientSecret ? (
                    <div className="pp-error">Gabim duke ngarkuar Stripe. Kontrollo çelësin.</div>
                  ) : (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm clientSecret={clientSecret} onSuccess={handleSuccess} />
                    </Elements>
                  )}
                </div>
              </div>

              {/* RIGHT — Order summary */}
              <div className="col-lg-5">
                <div className="pp-summary">
                  <div className="pp-summary-title">Përmbledhja</div>

                  {Object.entries(grouped).map(([sector, seats]) => (
                    <div key={sector} className="pp-sector-group">
                      <div className="pp-sector-label">Sektori {sector}</div>
                      {seats.map(s => (
                        <div key={s.id} className="pp-seat-row">
                          <span>Ulëse {s.seatNumber}{s.isVip ? " VIP" : ""}</span>
                          <span>€{s.price}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="pp-total">
                    <span>Total</span>
                    <span>€{total}</span>
                  </div>

                  <div className="pp-mu-brand">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
                      alt="MUFC" style={{ height: 32 }}
                    />
                    <span>Manchester United FC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
