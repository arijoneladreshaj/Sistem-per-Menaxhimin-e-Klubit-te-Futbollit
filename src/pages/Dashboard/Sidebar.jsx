import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";

const NAV_LINKS = [
  {
    section: "Kryesor",
    items: [{ label: "Dashboard", path: "/dashboard", icon: "bi-speedometer2" }],
  },
  {
    section: "Menaxhim",
    items: [
      { label: "Lojtarët",   path: "/DashboardPlayers",  icon: "bi-people",        badge: null },
      { label: "Stafi",      path: "/staff",              icon: "bi-person-badge",  badge: null },
      { label: "Ndeshjet",   path: "/dashboardNdeshjet",  icon: "bi-trophy",        badge: null },
      { label: "Store",      path: "/DashboardStore",     icon: "bi-shop",          badge: null },
    ],
  },
  {
    section: "Tjetër",
    items: [
      { label: "Lajmet",     path: "/lajmet",             icon: "bi-newspaper",     badge: null },
    ],
  },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo-area">
        <div className="crest" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>MU</div>
        <div className="club-name">
          Manchester<span>United FC</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 overflow-auto py-2">
        {NAV_LINKS.map((group) => (
          <React.Fragment key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.items.map((item) => {
              const active = pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <div
                  key={item.path}
                  className={`nav-item${active ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: 14, width: 16, textAlign: "center" }} />
                  {item.label}
                  {item.badge != null && (
                    <span className="badge ms-auto" style={{ background: "#DA291C" }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="badge fw-bold" style={{ background: "#FBE122", color: "#000" }}>2025/26</span>
        <span style={{ fontSize: 11, color: "#888" }}>Premier League</span>
      </div>
    </aside>
  );
}
