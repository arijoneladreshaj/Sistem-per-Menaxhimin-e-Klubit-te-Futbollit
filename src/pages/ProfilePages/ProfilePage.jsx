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

  const [storedUser, setStoredUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [formData, setFormData] = useState({
    username: (storedUser.username && !storedUser.username.includes("@")) ? storedUser.username : "",
    emri: storedUser.emri || "",
    mbiemri: storedUser.mbiemri || "",
    email: storedUser.email || "",
    datelindja: storedUser.datelindja ? storedUser.datelindja.split("T")[0] : "",
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passErrors, setPassErrors] = useState({});
  const [passSaved, setPassSaved] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("ticket");

  const [showAccModal, setShowAccModal] = useState(false);

  const userEmail = storedUser.email;
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api
      .get("/api/tickets/my")
      .then((res) => setTickets(res.data))
      .catch(() => setTickets([]));
  }, []);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/api/orders/my")
      .then(res => setOrders(res.data))
      .catch(() => {});
  }, []);
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

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username është i detyrueshëm!";
    else if (formData.username.includes("@")) newErrors.username = "Username nuk mund të jetë email adresë!";
    if (!formData.emri.trim()) newErrors.emri = "Emri është i detyrueshëm!";
    if (!formData.mbiemri.trim())
      newErrors.mbiemri = "Mbiemri është i detyrueshëm!";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email-i nuk është i vlefshëm!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await api.put(`/api/users/${storedUser.id}`, formData);
      const savedUser = res.data?.user;
      const newUser = {
        ...storedUser,
        ...(savedUser ?? formData),
        datelindja: savedUser?.datelindja || formData.datelindja || "",
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      setStoredUser(newUser);
      setSaved(true);
      setErrors({});
    } catch (e) {
      const msg = e.response?.data?.message;
      if (msg) setErrors({ general: msg });
      else setErrors({ general: `Gabim: ${e.message || "Provo sërish."}` });
    }
  };

  const handlePassChange = (e) => {
    setPassSaved(false);
    setPassData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSavePassword = async () => {
    const errs = {};
    if (!passData.currentPassword.trim()) errs.currentPassword = "Fjalëkalimi aktual është i detyrueshëm!";
    if (!passData.newPassword.trim()) errs.newPassword = "Fjalëkalimi i ri është i detyrueshëm!";
    else if (passData.newPassword.length < 6) errs.newPassword = "Duhet të ketë së paku 6 karaktere!";
    if (passData.newPassword !== passData.confirmPassword) errs.confirmPassword = "Fjalëkalimet nuk përputhen!";

    if (Object.keys(errs).length > 0) { setPassErrors(errs); return; }

    try {
      await api.put(`/api/users/${storedUser.id}/password`, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPassErrors({});
      setPassSaved(true);
    } catch (e) {
      setPassErrors({ general: e.response?.data?.message || "Gabim gjatë ndryshimit të fjalëkalimit" });
    }
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
      if (deleteType === "order") {
        await api.delete(`/api/orders/${orderToDelete}`);
        setOrders(prev => prev.filter(o => o.id !== orderToDelete));
      } else {
        await api.delete(`/api/tickets/${orderToDelete}`);
        setTickets(prev => prev.filter(t => t.id !== orderToDelete));
      }
    } catch (e) { console.error(e); }
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete(`/api/users/${storedUser.id}`);
      localStorage.clear();
      navigate("/register");
    } catch (e) {
      console.error(e);
      alert("Gabim gjatë fshirjes së llogarisë. Provo sërish.");
    }
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
              {storedUser.username && (
                <div className="pp-email">@{storedUser.username}</div>
              )}
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
                    <div className="col-sm-12">
                      <label className="pp-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        className="form-control pp-input"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="off"
                        placeholder="Zgjedh username-in tënd..."
                      />
                      {errors.username && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {errors.username}
                        </span>
                      )}
                    </div>
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

                  {errors.general && (
                    <div style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>
                      {errors.general}
                    </div>
                  )}
                  <div className="mt-4 d-flex align-items-center gap-3">
                    <button className="pp-save-btn" onClick={handleSave}>
                      Ruaj Ndryshimet
                    </button>
                    {saved && <span className="pp-saved">✓ U ruajt!</span>}
                  </div>

                  {/* ── NDRYSHO FJALËKALIMIN ── */}
                  <hr style={{ borderColor: "#333", margin: "32px 0 24px" }} />
                  <h5 style={{ color: "#ccc", marginBottom: "16px" }}>Ndrysho Fjalëkalimin</h5>
                  <div className="row g-3">
                    <div className="col-sm-12">
                      <label className="pp-label">Fjalëkalimi Aktual</label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="form-control pp-input"
                        value={passData.currentPassword}
                        onChange={handlePassChange}
                        placeholder="Shkruaj fjalëkalimin aktual..."
                      />
                      {passErrors.currentPassword && (
                        <span style={{ color: "red", fontSize: "12px" }}>{passErrors.currentPassword}</span>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label className="pp-label">Fjalëkalimi i Ri</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="form-control pp-input"
                        value={passData.newPassword}
                        onChange={handlePassChange}
                        placeholder="Fjalëkalimi i ri..."
                      />
                      {passErrors.newPassword && (
                        <span style={{ color: "red", fontSize: "12px" }}>{passErrors.newPassword}</span>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label className="pp-label">Konfirmo Fjalëkalimin</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control pp-input"
                        value={passData.confirmPassword}
                        onChange={handlePassChange}
                        placeholder="Konfirmo fjalëkalimin e ri..."
                      />
                      {passErrors.confirmPassword && (
                        <span style={{ color: "red", fontSize: "12px" }}>{passErrors.confirmPassword}</span>
                      )}
                    </div>
                  </div>
                  {passErrors.general && (
                    <div style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>{passErrors.general}</div>
                  )}
                  <div className="mt-4 d-flex align-items-center gap-3">
                    <button className="pp-save-btn" onClick={handleSavePassword}>
                      Ndrysho Fjalëkalimin
                    </button>
                    {passSaved && <span className="pp-saved">✓ Fjalëkalimi u ndryshua!</span>}
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
                                setDeleteType("ticket");
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
                          {t.payment_status === "Paguar" && (
                            <div className="pp-order-footer">
                              ✅ Pagesa u krye me kartë
                            </div>
                          )}
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
                                {new Date(order.created_at).toLocaleDateString("sq-AL")}
                              </span>
                            </div>

                            <span className="pp-order-total">
                              €{order.total.toFixed(2)}
                            </span>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setOrderToDelete(order.id);
                                setDeleteType("order");
                                setShowDeleteModal(true);
                              }}
                            >
                              Anulo
                            </button>
                          </div>

                          {order.items.map((item, idx) => (
                            <div key={idx} className="pp-seat-row">
                              <div className="pp-seat-left">
                                <span className="pp-seat-num">{item.emri}</span>
                                <span className="pp-seat-sector">Madhësia: {item.madhesia}</span>
                                <span className="pp-passenger">Sasia: x{item.sasia}</span>
                              </div>
                              <span className="pp-seat-price">
                                €{(item.cmimi * item.sasia).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          <div className="pp-order-footer">
                            {order.stripe_payment_id
                              ? "✅ Pagesa u krye me kartë"
                              : "📦 Cash on Delivery"}
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
