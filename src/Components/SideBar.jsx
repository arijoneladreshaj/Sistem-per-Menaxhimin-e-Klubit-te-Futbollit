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
      { label: "Lojtarët",    path: "/DashboardPlayers",  roles: ["Admin","Trajner"] },
      { label: "Formacioni",  path: "/lineup",            roles: ["Admin","Trajner"] },
      { label: "Store",       path: "/DashboardStore",    roles: ["Admin","Menaxher"] },
      { label: "Stafi",       path: "/staff",             roles: ["Admin"] },
      { label: "Ndeshjet",    path: "/dashboardNdeshjet", roles: ["Admin"] },
      { label: "Stërvitjet",  path: "/training",          roles: ["Admin","Trajner"] },
      { label: "Biletat",     path: "/DashboardBiletat",  roles: ["Admin","Menaxher"] },
      { label: "Përdoruesit", path: "/DashboardUsers",    roles: ["Admin"] },
      { label: "Mesazhet",    path: "/messages",          roles: ["Admin"] },
    ],
  },
  {
    section: "Financa",
    items: [
      { label: "Transferimet", path: "/transfers", roles: ["Admin","Menaxher"] },
      { label: "Kontratat",    path: "/contracts", roles: ["Admin","Menaxher"] },
    ],
  },
  {
    section: "Analitikë",
    items: [
      { label: "Dëmtimet", path: "/injuries", roles: ["Admin","Trajner"] },
      { label: "Sezonet",  path: "/seasons",  roles: ["Admin"] },
      { label: "Klubet",   path: "/clubs",    roles: ["Admin"] },
    ],
  },
];

export default function SideBar({ active }) {
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "").toLowerCase();

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
          const visibleItems = group.items.filter(item => item.roles.map(r => r.toLowerCase()).includes(role));
          if (visibleItems.length === 0) return null;
          return (
            <React.Fragment key={group.section}>
              <div className="nav-section">{group.section}</div>
              {visibleItems.map((item) => (
                  <div
                    key={item.path}
                    className={`nav-item ${active === item.path ? "active" : ""}`}
                    onClick={() => navigate(item.path)}
                  >
                    <div className="nav-dot" />
                    {item.label}
                  </div>
                ))}
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