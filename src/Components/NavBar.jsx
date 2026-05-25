import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import "../pages/ManchesterUnitedHome.css";

const STAFF_ROLES = ["Admin", "Trajner", "Menaxher"];
const PLAYER_ROLE = "Lojtari";
const NAV_LINKS   = ["Lajmet", "Ndeshjet", "Lojtarët", "Store", "Sezonet"];

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (STAFF_ROLES.includes(role)) return;
    const fetchCount = () =>
      api.get("/api/notifications/unread-count")
        .then(res => setUnread(res.data.count))
        .catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <nav className="mu-nav">
      <div className="mu-nav-left">
        <div className="mu-logo" onClick={() => navigate("/")}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
            alt="MUFC" style={{ height: "40px" }}
          />
          <span className="mu-logo-name">Manchester United</span>
        </div>
        <ul className="mu-nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              {link === "Ndeshjet" ? <Link to="/ndeshjet">{link}</Link>
              : link === "Store"   ? <Link to="/Store">{link}</Link>
              : link === "Lojtarët"? <Link to="/players">{link}</Link>
              : link === "Lajmet"  ? <Link to="/lajmet">{link}</Link>
              : link === "Sezonet" ? <Link to="/sezonet">{link}</Link>
              : <a href="#">{link}</a>}
            </li>
          ))}
          {STAFF_ROLES.includes(role) && (
            <li><Link to="/dashboard">Dashboard</Link></li>
          )}
        </ul>
      </div>

      <div className="mu-nav-right">

        {!STAFF_ROLES.includes(role) && (
          <button
            onClick={() => navigate("/notifications")}
            style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative", padding: "4px 8px" }}
          >
            <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && (
              <span style={{ position: "absolute", top: 0, right: 0, background: "#DA291C", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 700, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        )}

        <div
          className="mu-avatar"
          onClick={() => {
            if (STAFF_ROLES.includes(role) || role === PLAYER_ROLE) navigate("/DashboardProfile");
            else navigate("/ProfilePage");
          }}
          title={`${user.emri ?? ""} ${user.mbiemri ?? ""}`}
        >
          {user.emri?.[0] ?? ""}
          {user.mbiemri?.[0] ?? ""}
        </div>

        {!STAFF_ROLES.includes(role) && role !== PLAYER_ROLE && (
          <button className="mu-btn-solid" onClick={() => navigate("/ndeshjet?tab=fixtures")}>
            Bli Bileta
          </button>
        )}
      </div>
    </nav>
  );
}
