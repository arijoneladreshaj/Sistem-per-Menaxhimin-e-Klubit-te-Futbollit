import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import api from "../../api/axiosInstance";
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
  const [errors, setErrors] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const [showAccModal, setShowAccModal] = useState(false);

  const userEmail = storedUser.email;
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api
      .get("/api/tickets/my")
      .then((res) => setTickets(res.data))
      .catch(() => setTickets([]));
  }, []);
  const [orders, setOrders] = useState(
    JSON.parse(localStorage.getItem(`myOrders_${userEmail}`) || "[]"),
  );
  if (!storedUser.id) {
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
    const newErrors = {};
    if (!formData.emri.trim()) newErrors.emri = "Emri është i detyrueshëm!";
    if (!formData.mbiemri.trim())
      newErrors.mbiemri = "Mbiemri është i detyrueshëm!";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email-i nuk është i vlefshëm!";
    if (!formData.datelindja)
      newErrors.datelindja = "Datëlindja është e detyrueshme!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({ ...storedUser, ...formData }),
    );
    setSaved(true);
    setErrors({});
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      api.post("/logout", { refreshToken }).catch(() => {});
    }
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleDeleteOrder = async () => {
    try {
      await api.delete(`/api/tickets/${orderToDelete}`);
      setTickets((prev) => prev.filter((t) => t.id !== orderToDelete));
    } catch (e) {
      console.error(e);
    }
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem(`myTickets_${userEmail}`);
    navigate("/register");
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
                  <span className="pp-badge">{tickets.length}</span>
                )}
              </div>
              <div
                className={`pp-nav-link ${activeTab === "porosite" ? "pp-nav-link--active" : ""}`}
                onClick={() => setActiveTab("porosite")}
              >
                Blerjet e Mia
                {orders.length > 0 && (
                  <span className="pp-badge">{orders.length}</span>
                )}
              </div>

              <div className="pp-divider" />

              <button className="pp-logout" onClick={handleLogout}>
                Çkyçu
              </button>
              <button
                className="pp-delete-acc"
                onClick={() => setShowAccModal(true)}
              >
                Fshi Llogarinë
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
                      {errors.emri && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {errors.emri}
                        </span>
                      )}
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
                      {errors.mbiemri && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {errors.mbiemri}
                        </span>
                      )}
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
                      {errors.email && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {errors.email}
                        </span>
                      )}
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
                      {errors.datelindja && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {errors.datelindja}
                        </span>
                      )}
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
                      {tickets.map((t) => (
                        <div key={t.id} className="pp-order">
                          <div className="pp-order-header">
                            <div>
                              <span className="pp-order-id">
                                Man United vs {t.ekipi_kundershtare || "—"}
                              </span>
                              <span className="pp-order-date">
                                {t.data_ndeshjes
                                  ? new Date(
                                      t.data_ndeshjes,
                                    ).toLocaleDateString("sq-AL")
                                  : "—"}
                                {t.stadiumi ? ` · ${t.stadiumi}` : ""}
                              </span>
                            </div>
                            <span className="pp-order-total">
                              €{Number(t.cmimi).toFixed(2)}
                            </span>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setOrderToDelete(t.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              Anulo
                            </button>
                          </div>
                          <div className="pp-seat-row">
                            <div className="pp-seat-left">
                              <span className="pp-seat-num">
                                Ulëse {t.numri_uleses}
                              </span>
                              <span className="pp-seat-sector">
                                {t.sektori}
                              </span>
                              {t.is_vip ? (
                                <span className="pp-vip">VIP</span>
                              ) : null}
                              {(t.emri_bleresit || t.mbiemri_bleresit) && (
                                <span className="pp-passenger">
                                  {t.emri_bleresit} {t.mbiemri_bleresit}
                                </span>
                              )}
                            </div>
                            <span
                              className={`pp-seat-price ${t.statusi === "E shitur" ? "" : "text-warning"}`}
                            >
                              {t.statusi}
                            </span>
                          </div>
                          <div className="pp-order-footer">
                            💵 Paguaj në hyrje të stadiumit
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "porosite" && (
                <div className="pp-section">
                  <h2 className="pp-section-title">Blerjet e Mia</h2>

                  {orders.length === 0 ? (
                    <div className="pp-no-tickets">
                      <p>Nuk ke blerje ende.</p>

                      <button
                        className="btn btn-danger pp-buy-btn"
                        onClick={() => navigate("/store")}
                      >
                        Shko te Dyqani
                      </button>
                    </div>
                  ) : (
                    <div className="pp-orders">
                      {[...orders].reverse().map((order) => (
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
                              €{order.total.toFixed(2)}
                            </span>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setOrderToDelete(order.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              Anulo
                            </button>
                          </div>

                          {order.items.map((item, idx) => (
                            <div key={idx} className="pp-seat-row">
                              <div className="pp-seat-left">
                                <span className="pp-seat-num">{item.name}</span>

                                <span className="pp-seat-sector">
                                  Madhësia: {item.selectedSize}
                                </span>

                                <span className="pp-passenger">
                                  Sasia: x{item.qty}
                                </span>
                              </div>

                              <span className="pp-seat-price">
                                €{(item.price * item.qty).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          <div className="pp-order-footer">
                            📦 Cash on Delivery
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
      {/* MODALI i fshirjes se porosise se biletave */}
      {showDeleteModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ background: "#1a1a1a", border: "1px solid #333" }}
            >
              <div
                className="modal-header"
                style={{ borderBottom: "1px solid #333" }}
              >
                <h5 className="modal-title" style={{ color: "white" }}>
                  Anulo Porosinë
                </h5>
              </div>
              <div className="modal-body" style={{ color: "#888" }}>
                A je i sigurt që dëshiron të anulosh këtë porosi?
              </div>
              <div
                className="modal-footer"
                style={{ borderTop: "1px solid #333" }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Mbyll
                </button>
                <button className="btn btn-danger" onClick={handleDeleteOrder}>
                  Anulo Porosinë
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALI i fshirjes se account (llogarise) */}
      {showAccModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ background: "#1a1a1a", border: "1px solid #333" }}
            >
              <div
                className="modal-header"
                style={{ borderBottom: "1px solid #333" }}
              >
                <h5 className="modal-title" style={{ color: "white" }}>
                  Fshi Llogarinë
                </h5>
              </div>
              <div className="modal-body" style={{ color: "#888" }}>
                A je i sigurt? Ky veprim nuk mund të kthehet!
              </div>
              <div
                className="modal-footer"
                style={{ borderTop: "1px solid #333" }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAccModal(false)}
                >
                  Anulo
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                >
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
