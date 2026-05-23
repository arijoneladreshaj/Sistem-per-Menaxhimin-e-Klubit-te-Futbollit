import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import api from "../../api/axiosInstance";
import "./Dashboard.css";

export default function DashboardProfile() {
  const navigate = useNavigate();

  const [storedUser, setStoredUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  const [formData, setFormData] = useState({
    username: storedUser.username && !storedUser.username.includes("@") ? storedUser.username : "",
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

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleChange = (e) => {
    setSaved(false);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username është i detyrueshëm!";
    else if (formData.username.includes("@")) newErrors.username = "Username nuk mund të jetë email adresë!";
    if (!formData.emri.trim()) newErrors.emri = "Emri është i detyrueshëm!";
    if (!formData.mbiemri.trim()) newErrors.mbiemri = "Mbiemri është i detyrueshëm!";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email-i nuk është i vlefshëm!";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

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
      setErrors({ general: msg || `Gabim: ${e.message || "Provo sërish."}` });
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
    if (refreshToken) api.post("/logout", { refreshToken }).catch(() => {});
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const initials = `${storedUser.emri?.[0] || ""}${storedUser.mbiemri?.[0] || ""}`;

  return (
    <div className="shell">
      <SideBar active="/DashboardProfile" />

      <div className="main">
        <TopBar title="Profili Im" />

        <div className="content">
          <div style={{ maxWidth: 720 }}>

            {/* Avatar & info */}
            <div className="panel" style={{ marginBottom: 20 }}>
              <div style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#DA291C", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
                    {storedUser.emri} {storedUser.mbiemri}
                  </div>
                  {storedUser.username && (
                    <div style={{ color: "#888", fontSize: 13 }}>@{storedUser.username}</div>
                  )}
                  <div style={{ color: "#888", fontSize: 13 }}>{storedUser.email}</div>
                  <span className="badge" style={{ background: "#DA291C", marginTop: 6, fontSize: 11 }}>
                    Admin
                  </span>
                </div>
              </div>
            </div>

            {/* Edit profile */}
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="panel-header">
                <div className="panel-title">Ndrysho të Dhënat</div>
              </div>
              <div style={{ padding: "16px 24px" }}>
                <div className="row g-3">
                  <div className="col-sm-12">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Username</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="off"
                      placeholder="Zgjedh username-in..."
                    />
                    {errors.username && <span style={{ color: "red", fontSize: 12 }}>{errors.username}</span>}
                  </div>
                  <div className="col-sm-6">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Emri</label>
                    <input
                      type="text"
                      name="emri"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                      value={formData.emri}
                      onChange={handleChange}
                    />
                    {errors.emri && <span style={{ color: "red", fontSize: 12 }}>{errors.emri}</span>}
                  </div>
                  <div className="col-sm-6">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Mbiemri</label>
                    <input
                      type="text"
                      name="mbiemri"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                      value={formData.mbiemri}
                      onChange={handleChange}
                    />
                    {errors.mbiemri && <span style={{ color: "red", fontSize: 12 }}>{errors.mbiemri}</span>}
                  </div>
                  <div className="col-sm-6">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span style={{ color: "red", fontSize: 12 }}>{errors.email}</span>}
                  </div>
                  <div className="col-sm-6">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Datëlindja</label>
                    <input
                      type="date"
                      name="datelindja"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff", colorScheme: "dark" }}
                      value={formData.datelindja}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {errors.general && (
                  <div style={{ color: "red", fontSize: 13, marginTop: 8 }}>{errors.general}</div>
                )}
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={handleSave}
                    style={{
                      background: "#DA291C", color: "#fff", border: "none",
                      borderRadius: 5, padding: "7px 18px", fontSize: 13,
                      fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Ruaj Ndryshimet
                  </button>
                  {saved && <span style={{ color: "#4ade80", fontSize: 13 }}>✓ U ruajt!</span>}
                </div>
              </div>
            </div>

            {/* Change password */}
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="panel-header">
                <div className="panel-title">Ndrysho Fjalëkalimin</div>
              </div>
              <div style={{ padding: "16px 24px" }}>
                <div className="row g-3">
                  <div className="col-sm-12">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Fjalëkalimi Aktual</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                      value={passData.currentPassword}
                      onChange={handlePassChange}
                      placeholder="Fjalëkalimi aktual..."
                    />
                    {passErrors.currentPassword && <span style={{ color: "red", fontSize: 12 }}>{passErrors.currentPassword}</span>}
                  </div>
                  <div className="col-sm-6">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Fjalëkalimi i Ri</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                      value={passData.newPassword}
                      onChange={handlePassChange}
                      placeholder="Fjalëkalimi i ri..."
                    />
                    {passErrors.newPassword && <span style={{ color: "red", fontSize: 12 }}>{passErrors.newPassword}</span>}
                  </div>
                  <div className="col-sm-6">
                    <label style={{ color: "#888", fontSize: 12, marginBottom: 4, display: "block" }}>Konfirmo Fjalëkalimin</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                      value={passData.confirmPassword}
                      onChange={handlePassChange}
                      placeholder="Konfirmo fjalëkalimin..."
                    />
                    {passErrors.confirmPassword && <span style={{ color: "red", fontSize: 12 }}>{passErrors.confirmPassword}</span>}
                  </div>
                </div>
                {passErrors.general && (
                  <div style={{ color: "red", fontSize: 13, marginTop: 8 }}>{passErrors.general}</div>
                )}
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={handleSavePassword}
                    style={{
                      background: "#DA291C", color: "#fff", border: "none",
                      borderRadius: 5, padding: "7px 18px", fontSize: 13,
                      fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Ndrysho Fjalëkalimin
                  </button>
                  {passSaved && <span style={{ color: "#4ade80", fontSize: 13 }}>✓ Fjalëkalimi u ndryshua!</span>}
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Seksioni i Rrezikshëm</div>
              </div>
              <div style={{ padding: "16px 24px" }}>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  style={{
                    background: "transparent", color: "#DA291C",
                    border: "1px solid #DA291C", borderRadius: 5,
                    padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Çkyçu nga Sistemi
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Logout modal */}
      {showLogoutModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #333" }}>
                <h5 className="modal-title" style={{ color: "#fff" }}>Çkyçu</h5>
              </div>
              <div className="modal-body" style={{ color: "#888" }}>
                A je i sigurt që dëshiron të çkyçesh?
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid #333" }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    background: "#2a2a2a", color: "#888", border: "1px solid #333",
                    borderRadius: 5, padding: "7px 16px", fontSize: 13, cursor: "pointer",
                  }}
                >
                  Anulo
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#DA291C", color: "#fff", border: "none",
                    borderRadius: 5, padding: "7px 16px", fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Çkyçu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
