import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeSeat, updatePassenger, total, clearCart } = useCart();

  const allNamed = cart.every((s) => s.firstName?.trim() && s.lastName?.trim());

  if (cart.length === 0) {
    return (
      <div className="cp-empty">
        <div className="cp-empty-box">
          <div className="cp-empty-icon">🛒</div>
          <h2>Shporta është bosh</h2>
          <p>Shko dhe zgjidh ulësen tënde!</p>
          <button
            className="btn btn-danger"
            onClick={() => navigate("/ndeshjet?tab=fixtures")}
          >
            Bli Biletat
          </button>
        </div>
      </div>
    );
  }

  // Grupoj sipas ndeshjes + sektorit
  const grouped = cart.reduce((acc, seat) => {
    const key = `${seat.matchId}-${seat.sectorId}`;
    if (!acc[key]) {
      acc[key] = {
        matchId: seat.matchId,
        sectorName: seat.sectorName,
        seats: [],
      };
    }
    acc[key].seats.push(seat);
    return acc;
  }, {});

  return (
    <div className="cp-page">
      {/* HEADER */}
      <div className="cp-header">
        <button className="cp-back" onClick={() => navigate(-1)}>
          ← Kthehu
        </button>
        <h1 className="cp-title">Your Cart</h1>
      </div>

      <div className="container">
        <div className="row g-4">
          {/* MAJTAS — ulëset */}
          <div className="col-lg-8">
            {Object.values(grouped).map((group, gi) => (
              <div key={gi} className="cp-group mb-4">
                <div className="cp-group-header">
                  Sektori {group.sectorName}
                </div>

                {group.seats.map((seat) => (
                  <div key={seat.id} className="cp-item">
                    <div className="cp-item-top">
                      <div>
                        <div className="cp-item-title">
                          Ulëse {seat.seatNumber}
                          {seat.isVip && (
                            <span className="cp-vip-badge">VIP</span>
                          )}
                        </div>
                        <div className="cp-item-price">1 × €{seat.price}</div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm cp-remove"
                        onClick={() => removeSeat(seat.id)}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Emri dhe Mbiemri */}
                    <div className="row g-2 mt-2">
                      <div className="col-sm-6">
                        <label className="cp-label">Seat First Name:</label>
                        <input
                          type="text"
                          className="form-control cp-input"
                          placeholder="Emri"
                          value={seat.firstName}
                          onChange={(e) =>
                            updatePassenger(
                              seat.id,
                              "firstName",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="cp-label">Seat Last Name:</label>
                        <input
                          type="text"
                          className="form-control cp-input"
                          placeholder="Mbiemri"
                          value={seat.lastName}
                          onChange={(e) =>
                            updatePassenger(seat.id, "lastName", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* DJATHTAS — rezymeja */}
          <div className="col-lg-4">
            <div className="cp-summary">
              <div className="cp-summary-title">Përmbledhja e porosisë</div>

              <div className="cp-summary-rows">
                {cart.map((seat) => (
                  <div key={seat.id} className="cp-summary-row">
                    <span>
                      Ulëse {seat.seatNumber} ({seat.sectorName})
                      {seat.isVip && " VIP"}
                    </span>
                    <span>€{seat.price}</span>
                  </div>
                ))}
              </div>

              <div className="cp-summary-total">
                <span>Total:</span>
                <span>€{total}</span>
              </div>

              {!allNamed && (
                <div className="alert alert-warning cp-warning">
                  ⚠ Plotëso emrat e të gjithë tifozëve
                </div>
              )}

              <button
                className="btn btn-danger w-100 cp-checkout-btn"
                disabled={!allNamed}
                onClick={() => navigate("/ConfirmationPage")}
              >
                Vazhdo me Porosinë →
              </button>

              <button
                className="btn btn-outline-secondary w-100 mt-2 cp-add-more"
                onClick={() => navigate("/ndeshjet?tab=fixtures")}
              >
                + Shto Bileta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
