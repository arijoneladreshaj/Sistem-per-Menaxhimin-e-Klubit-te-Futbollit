import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ConfirmationPage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

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
              <p className="cf-date">{order.date} · {order.time}</p>
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
                        <span className="cf-seat-num">Ulëse {seat.seatNumber}</span>
                        {seat.isVip && <span className="cf-vip">VIP</span>}
                        <span className="cf-passenger">{seat.firstName} {seat.lastName}</span>
                      </div>
                      <span className="cf-seat-price">€{seat.price}</span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="cf-total-row">
                <span>Total</span>
                <span>€{order.total}</span>
              </div>
            </div>

            {/* PAGESA STATUS */}
            {order.paid ? (
              <div className="cf-payment-notice" style={{ borderLeftColor: "#4ade80" }}>
                <div className="cf-notice-icon">✅</div>
                <div>
                  <div className="cf-notice-title" style={{ color: "#4ade80" }}>
                    Pagesa u krye me sukses
                  </div>
                  <div className="cf-notice-sub">
                    ID e transaksionit: <strong>{order.paymentId}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cf-payment-notice">
                <div className="cf-notice-icon">💵</div>
                <div>
                  <div className="cf-notice-title">Paguaj në hyrje të stadiumit</div>
                  <div className="cf-notice-sub">
                    Sill këtë konfirmim ose numrin e porosisë #{order.id} në hyrje.
                  </div>
                </div>
              </div>
            )}

            {/* BUTONAT */}
            <div className="cf-actions">
              <button
                className="btn btn-danger cf-btn-main"
                onClick={() => navigate("/ProfilePage", { state: { tab: "biletat" } })}
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
