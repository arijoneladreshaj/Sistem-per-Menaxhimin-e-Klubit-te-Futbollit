import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BuyTicketsPage/ConfirmationPage.css";
export default function StoreConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orderData = location.state?.order;
    if (!orderData) return;

    // Ruaj porosinë në localStorage
    const userEmail = JSON.parse(localStorage.getItem("user") || "{}").email;
    const key = `myOrders_${userEmail}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const newOrder = {
      id: Date.now(),
      date: new Date().toLocaleDateString("sq-AL"),
      time: new Date().toLocaleTimeString("sq-AL"),
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
    };
    localStorage.setItem(key, JSON.stringify([...existing, newOrder]));
    setOrder(newOrder);
  }, [location.state]);

  // Fallback: nëse nuk ka state, merr porosinë e fundit
  useEffect(() => {
    if (!order && !location.state?.order) {
      const userEmail = JSON.parse(localStorage.getItem("user") || "{}").email;
      const allOrders = JSON.parse(
        localStorage.getItem(`myOrders_${userEmail}`) || "[]"
      );
      if (allOrders.length > 0) {
        setOrder(allOrders[allOrders.length - 1]);
      }
    }
  }, [order, location.state]);

  if (!order) {
    return (
      <div className="cf-empty">
        <p>Nuk ka porosi aktive.</p>
        <button className="btn btn-danger" onClick={() => navigate("/store")}>
          Kthehu te Dyqani
        </button>
      </div>
    );
  }

  // Grupo sipas kategorisë
  const grouped = order.items.reduce((acc, item) => {
    const cat = item.cat || "Produkte";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="cf-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            {/* SUKSES */}
            <div className="cf-success-box">
              <div className="cf-check">✓</div>
              <h1 className="cf-title">Porosia u Konfirmua!</h1>
              <p className="cf-subtitle">
                Numri i porosisë: <strong>#{order.id}</strong>
              </p>
              <p className="cf-date">
                {order.date} · {order.time}
              </p>
            </div>

            {/* DETAJET */}
            <div className="cf-details">
              <div className="cf-details-title">Detajet e Porosisë</div>

              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="cf-sector-group">
                  <div className="cf-sector-label">{category}</div>
                  {items.map((item, idx) => (
                    <div key={item.cartId || idx} className="cf-seat-row">
                      <div className="cf-seat-info">
                        <span className="cf-seat-num">{item.name}</span>
                        <span className="cf-passenger">
                          Madhësia: {item.selectedSize} · x{item.qty}
                        </span>
                      </div>
                      <span className="cf-seat-price">
                        €{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* NËNTOTALI & DËRGESA */}
              <div
                className="cf-seat-row"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="cf-seat-info">
                  <span className="cf-seat-num">Nëntotali</span>
                </div>
                <span className="cf-seat-price">
                  €{order.subtotal.toFixed(2)}
                </span>
              </div>
              <div
                className="cf-seat-row"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="cf-seat-info">
                  <span className="cf-seat-num">Dërgesa</span>
                </div>
                <span
                  className="cf-seat-price"
                  style={{
                    color: order.shipping === 0 ? "#4ade80" : undefined,
                  }}
                >
                  {order.shipping === 0
                    ? "FALAS"
                    : `€${order.shipping.toFixed(2)}`}
                </span>
              </div>

              {/* TOTAL */}
              <div className="cf-total-row">
                <span>Total</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* DËRGESA INFO */}
            <div className="cf-payment-notice">
              <div className="cf-notice-icon">📦</div>
              <div>
                <div className="cf-notice-title">Dërgesa</div>
                <div className="cf-notice-sub">
                  Porosia #{order.id} do të dërgohet brenda 3-5 ditëve pune.
                  Do të merrni një email me numrin e gjurmimit.
                </div>
              </div>
            </div>

            {/* PAGESA */}
            <div className="cf-payment-notice">
              <div className="cf-notice-icon">💳</div>
              <div>
                <div className="cf-notice-title">Pagesa me Cash on Delivery</div>
                <div className="cf-notice-sub">
                  Paguani €{order.total.toFixed(2)} kur të merrni porosinë.
                  Sillni numrin e porosisë #{order.id}.
                </div>
              </div>
            </div>

            {/* BUTONAT */}
            <div className="cf-actions">
              <button
                className="btn btn-danger cf-btn-main"
                onClick={() =>
                  navigate("/ProfilePage", { state: { tab: "porositë" } })
                }
              >
                Shiko Porositë e Mia
              </button>
              <button
                className="btn btn-outline-secondary cf-btn-sec"
                onClick={() => navigate("/store")}
              >
                Vazhdo Blerjen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
