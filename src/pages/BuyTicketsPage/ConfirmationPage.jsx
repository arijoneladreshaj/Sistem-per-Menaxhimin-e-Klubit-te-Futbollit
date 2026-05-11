import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ConfirmationPage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();

  // Ruaj porosinë në localStorage dhe pastro cart-in
  useEffect(() => {
    if (cart.length === 0) return;

    const order = {
      id: Date.now(),
      date: new Date().toLocaleDateString("sq-AL"),
      time: new Date().toLocaleTimeString("sq-AL"),
      seats: cart,
      total,
    };

    const userEmail = JSON.parse(localStorage.getItem("user") || "{}").email;
    const key = `myTickets_${userEmail}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([...existing, order]));

    clearCart();
  }, []);

  // Merr porosinë e fundit nga localStorage
  const userEmail = JSON.parse(localStorage.getItem("user") || "{}").email;
  const allOrders = JSON.parse(
    localStorage.getItem(`myTickets_${userEmail}`) || "[]",
  );
  const order = allOrders[allOrders.length - 1];

  if (!order) {
    return (
      <div className="cf-empty">
        <p>Nuk ka porosi aktive.</p>
        <button className="btn btn-danger" onClick={() => navigate("/")}>
          Shko në Kryefaqe
        </button>
      </div>
    );
  }

  // Grupo ulëset sipas sektorit
  const grouped = order.seats.reduce((acc, seat) => {
    if (!acc[seat.sectorName]) acc[seat.sectorName] = [];
    acc[seat.sectorName].push(seat);
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

              {Object.entries(grouped).map(([sectorName, seats]) => (
                <div key={sectorName} className="cf-sector-group">
                  <div className="cf-sector-label">Sektori {sectorName}</div>
                  {seats.map((seat) => (
                    <div key={seat.id} className="cf-seat-row">
                      <div className="cf-seat-info">
                        <span className="cf-seat-num">
                          Ulëse {seat.seatNumber}
                        </span>
                        {seat.isVip && <span className="cf-vip">VIP</span>}
                        <span className="cf-passenger">
                          {seat.firstName} {seat.lastName}
                        </span>
                      </div>
                      <span className="cf-seat-price">€{seat.price}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* TOTAL */}
              <div className="cf-total-row">
                <span>Total</span>
                <span>€{order.total}</span>
              </div>
            </div>

            {/* PAGESA */}
            <div className="cf-payment-notice">
              <div className="cf-notice-icon">💵</div>
              <div>
                <div className="cf-notice-title">
                  Paguaj në hyrje të stadiumit
                </div>
                <div className="cf-notice-sub">
                  Sill këtë konfirmim ose numrin e porosisë #{order.id} në
                  hyrje.
                </div>
              </div>
            </div>

            {/* BUTONAT */}
            <div className="cf-actions">
              <button
                className="btn btn-danger cf-btn-main"
                onClick={() =>
                  navigate("/ProfilePage", { state: { tab: "biletat" } })
                }
              >
                Shiko Biletat e Mia
              </button>
              <button
                className="btn btn-outline-secondary cf-btn-sec"
                onClick={() => navigate("/")}
              >
                Shko në Kryefaqe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
