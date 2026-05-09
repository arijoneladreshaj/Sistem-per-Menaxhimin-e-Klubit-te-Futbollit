import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProfilePage.css";
import "../ManchesterUnitedHome.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "profili");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [formData, setFormData] = useState({
    emri: storedUser.emri || "",
    mbiemri: storedUser.mbiemri || "",
    email: storedUser.email || "",
    datelindja: storedUser.datelindja || "",
  });
  const [saved, setSaved] = useState(false);

  const tickets = JSON.parse(localStorage.getItem("myTickets") || "[]");

  if (!storedUser.emri) {
    return (
      <div className="pp-empty">
        <p>Nuk je i kyçur!</p>
        <button className="btn btn-danger" onClick={() => navigate("/login")}>
          Kyçu
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setSaved(false);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ ...storedUser, ...formData }),
    );
    setSaved(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = `${storedUser.emri?.[0] || ""}${storedUser.mbiemri?.[0] || ""}`;

  return (
    <div className="mu-wrap">
      <NavBar />
      <div className="pp-page">
        <div className="container-fluid">
          <div className="row">
            {/* ── SIDEBAR ── */}
            <div className="col-lg-3 pp-sidebar">
              {/* Avatar */}
              <div className="pp-avatar">{initials}</div>
              <div className="pp-name">
                {storedUser.emri} {storedUser.mbiemri}
              </div>
              <div className="pp-email">{storedUser.email}</div>

              <div className="pp-divider" />

              {/* Nav links */}
              <div
                className={`pp-nav-link ${activeTab === "profili" ? "pp-nav-link--active" : ""}`}
                onClick={() => setActiveTab("profili")}
              >
                Profili
              </div>
              <div
                className={`pp-nav-link ${activeTab === "biletat" ? "pp-nav-link--active" : ""}`}
                onClick={() => setActiveTab("biletat")}
              >
                Biletat e Mia
                {tickets.length > 0 && (
                  <span className="pp-badge">
                    {tickets.reduce((s, o) => s + o.seats.length, 0)}
                  </span>
                )}
              </div>

              <div className="pp-divider" />

              <button className="pp-logout" onClick={handleLogout}>
                Çkyçu
              </button>
            </div>

            {/* ── CONTENT ── */}
            <div className="col-lg-9 pp-content">
              {/* PROFILI TAB */}
              {activeTab === "profili" && (
                <div className="pp-section">
                  <h2 className="pp-section-title">Profili Im</h2>

                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="pp-label">Emri</label>
                      <input
                        type="text"
                        name="emri"
                        className="form-control pp-input"
                        value={formData.emri}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="pp-label">Mbiemri</label>
                      <input
                        type="text"
                        name="mbiemri"
                        className="form-control pp-input"
                        value={formData.mbiemri}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="pp-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control pp-input"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="pp-label">Datëlindja</label>
                      <input
                        type="date"
                        name="datelindja"
                        className="form-control pp-input"
                        value={formData.datelindja}
                        onChange={handleChange}
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 d-flex align-items-center gap-3">
                    <button className="pp-save-btn" onClick={handleSave}>
                      Ruaj Ndryshimet
                    </button>
                    {saved && <span className="pp-saved">✓ U ruajt!</span>}
                  </div>
                </div>
              )}

              {/* BILETAT TAB */}
              {activeTab === "biletat" && (
                <div className="pp-section">
                  <h2 className="pp-section-title">Biletat e Mia</h2>

                  {tickets.length === 0 ? (
                    <div className="pp-no-tickets">
                      <div className="pp-no-icon">🎫</div>
                      <p>Nuk ke bileta të blera ende.</p>
                      <button
                        className="btn btn-danger pp-buy-btn"
                        onClick={() => navigate("/ndeshjet?tab=fixtures")}
                      >
                        Bli Biletat
                      </button>
                    </div>
                  ) : (
                    <div className="pp-orders">
                      {[...tickets].reverse().map((order) => (
                        <div key={order.id} className="pp-order">
                          <div className="pp-order-header">
                            <div>
                              <span className="pp-order-id">
                                Porosia #{order.id}
                              </span>
                              <span className="pp-order-date">
                                {order.date} · {order.time}
                              </span>
                            </div>
                            <span className="pp-order-total">
                              €{order.total}
                            </span>
                          </div>
                          {order.seats.map((seat) => (
                            <div key={seat.id} className="pp-seat-row">
                              <div className="pp-seat-left">
                                <span className="pp-seat-num">
                                  Ulëse {seat.seatNumber}
                                </span>
                                <span className="pp-seat-sector">
                                  {seat.sectorName}
                                </span>
                                {seat.isVip && (
                                  <span className="pp-vip">VIP</span>
                                )}
                                <span className="pp-passenger">
                                  {seat.firstName} {seat.lastName}
                                </span>
                              </div>
                              <span className="pp-seat-price">
                                €{seat.price}
                              </span>
                            </div>
                          ))}
                          <div className="pp-order-footer">
                            💵 Paguaj në hyrje të stadiumit
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
