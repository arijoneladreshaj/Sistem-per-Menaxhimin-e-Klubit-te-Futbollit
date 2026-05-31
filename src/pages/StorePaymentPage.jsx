import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../api/axiosInstance";
import "../pages/BuyTicketsPage/PaymentPage.css";

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

      {error && (
        <div className="pp-error">
          <i className="bi bi-exclamation-circle" /> {error}
        </div>
      )}

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

export default function StorePaymentPage() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const orderData = state?.orderData;

  const [clientSecret,   setClientSecret]   = useState("");
  const [loadingIntent,  setLoadingIntent]   = useState(true);

  useEffect(() => {
    if (!orderData) { navigate("/Store"); return; }

    api.post("/api/payments/create-intent", { amount: orderData.total })
      .then(res => setClientSecret(res.data.clientSecret))
      .catch(() => setClientSecret(""))
      .finally(() => setLoadingIntent(false));
  }, []);

  const handleSuccess = async (paymentIntentId) => {
    try {
      const res = await api.post("/api/orders", {
        ...orderData,
        stripe_payment_id: paymentIntentId,
        payment_status: "Paguar",
      });
      navigate("/StoreConfirmation", { state: { orderId: res.data.orderId } });
    } catch {
      navigate("/StoreConfirmation", { state: { orderId: null } });
    }
  };

  if (!orderData) return null;

  return (
    <div className="pp-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            <div className="pp-header">
              <button className="pp-back" onClick={() => navigate("/Store")}>← Kthehu</button>
              <h1 className="pp-title">Pagesa e Sigurt</h1>
            </div>

            <div className="row g-4">
              {/* LEFT — Stripe form */}
              <div className="col-lg-7">
                <div className="pp-box">
                  <div className="pp-box-title">
                    <i className="bi bi-credit-card-fill" /> Informacioni i Pagesës
                  </div>

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

                  <div className="pp-sector-group">
                    <div className="pp-sector-label">Produkte</div>
                    {(orderData.items || []).map((item, i) => (
                      <div key={i} className="pp-seat-row">
                        <span>{item.name || item.emri} · {item.selectedSize || item.madhesia} × {item.qty || item.sasia}</span>
                        <span>€{((item.price || item.cmimi) * (item.qty || item.sasia)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pp-seat-row" style={{ paddingTop: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>Nëntotali</span>
                    <span>€{Number(orderData.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="pp-seat-row">
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>Dërgesa</span>
                    <span style={{ color: orderData.shipping === 0 ? "#4ade80" : "#fff" }}>
                      {orderData.shipping === 0 ? "FALAS" : `€${Number(orderData.shipping).toFixed(2)}`}
                    </span>
                  </div>

                  <div className="pp-total">
                    <span>Total</span>
                    <span>€{Number(orderData.total).toFixed(2)}</span>
                  </div>

                  <div className="pp-mu-brand">
                    <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
                      alt="MUFC" style={{ height: 32 }} />
                    <span>Manchester United Store</span>
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
