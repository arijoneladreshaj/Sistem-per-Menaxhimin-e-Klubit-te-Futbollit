import React from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  {
    section: "Kryesor",
    items: [
      { label: "Dashboard", path: "/dashboard", roles: ["Admin","Trajner","Menaxher"] },
    ],
  },
  {
    section: "Menaxhim",
    items: [
      { label: "Lojtarët",    path: "/DashboardPlayers",  badge: 6,    roles: ["Admin","Trajner"] },
      { label: "Store",       path: "/DashboardStore",    badge: 18,   roles: ["Admin","Menaxher"] },
      { label: "Stafi",       path: "/staff",             badge: 4,    roles: ["Admin"] },
      { label: "Ndeshjet",    path: "/dashboardNdeshjet", badge: 5,    roles: ["Admin"] },
      { label: "Stërvitjet",  path: "/training",          badge: 4,    roles: ["Admin","Trajner"] },
      { label: "Biletat",     path: "/DashboardBiletat",  badge: null, roles: ["Admin","Menaxher"] },
      { label: "Përdoruesit", path: "/DashboardUsers",    badge: null, roles: ["Admin"] },
    ],
  },
  {
    section: "Financa",
    items: [
      { label: "Transferimet", path: "/transfers", badge: 3, roles: ["Admin","Menaxher"] },
      { label: "Kontratat",    path: "/contracts", badge: 4, roles: ["Admin","Menaxher"] },
    ],
  },
  {
    section: "Analitikë",
    items: [
      { label: "Dëmtimet", path: "/injuries", badge: 4, roles: ["Admin","Trajner"] },
      { label: "Sezonet",  path: "/seasons",  badge: 3, roles: ["Admin"] },
      { label: "Klubet",   path: "/clubs",    badge: 3, roles: ["Admin"] },
    ],
  },
];

export default function SideBar({ active }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "";

  return (
    <aside className="sidebar">

      <div
        className="logo-area"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", flexDirection: "column", alignItems: "center", padding: "20px 16px" }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
          alt="MUFC"
          style={{ height: 52, marginBottom: 10 }}
        />
        <div className="club-name" style={{ textAlign: "center" }}>
          Manchester
          <span>United FC</span>
        </div>
      </div>

      <nav className="flex-grow-1 overflow-auto py-2">
        {navLinks.map((group) => {
          const visibleItems = group.items.filter(item => item.roles.includes(role));
          if (visibleItems.length === 0) return null;
          return (
            <React.Fragment key={group.section}>
              <div className="nav-section">{group.section}</div>
              {visibleItems.map((item) => {
                const badgeVal = item.badge;
                return (
                  <div
                    key={item.path}
                    className={`nav-item ${active === item.path ? "active" : ""}`}
                    onClick={() => navigate(item.path)}
                  >
                    <div className="nav-dot" />
                    {item.label}
                    {badgeVal > 0 && (
                      <span className="badge ms-auto" style={{ background: "#DA291C" }}>
                        {badgeVal}
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </nav>

      <div
        className={`nav-item ${active === "/DashboardProfile" ? "active" : ""}`}
        onClick={() => navigate("/DashboardProfile")}
        style={{ borderTop: "1px solid #2a2a2a", marginTop: "auto" }}
      >
        <div className="nav-dot" />
        Profili
      </div>

      <div className="sidebar-footer">
        <span
          className="badge fw-bold"
          style={{
            background: "#FBE122",
            color: "#000",
          }}
        >
          2025/26
        </span>

        <span
          style={{
            fontSize: 11,
            color: "#888",
          }}
        >
          Premier League
        </span>
      </div>
    </aside>
  );
}