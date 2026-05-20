import React from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  {
    section: "Kryesor",
    items: [
      { label: "Dashboard", path: "/dashboard" },
    ],
  },

  {
    section: "Menaxhim",
    items: [
      { label: "Lojtarët", path: "/DashboardPlayers", badge: 6 },
      { label: "Store", path: "/DashboardStore", badge: 18 },
      { label: "Stafi", path: "/staff", badge: 4 },
      { label: "Ndeshjet", path: "/dashboardNdeshjet", badge: 5 },
      { label: "Stërvitjet", path: "/training", badge: 4 },
    ],
  },

  {
    section: "Financa",
    items: [
      { label: "Transferimet", path: "/transfers", badge: 3 },
      { label: "Kontratat", path: "/contracts", badge: 4 },
    ],
  },

  {
    section: "Analitikë",
    items: [
      { label: "Dëmtimet", path: "/injuries", badge: 4 },
      { label: "Sezonet", path: "/seasons", badge: 3 },
      { label: "Klubet", path: "/clubs", badge: 3 },
    ],
  },
];

export default function SideBar({ active }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">

      <div className="logo-area">
        <div className="crest">MU</div>

        <div className="club-name">
          Manchester
          <span>United FC</span>
        </div>
      </div>

      <nav className="flex-grow-1 overflow-auto py-2">
        {navLinks.map((group) => (
          <React.Fragment key={group.section}>

            <div className="nav-section">
              {group.section}
            </div>

            {group.items.map((item) => (
              <div
                key={item.path}
                className={`nav-item ${
                  active === item.path ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <div className="nav-dot" />

                {item.label}

                {item.badge && (
                  <span
                    className="badge ms-auto"
                    style={{ background: "#DA291C" }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </nav>

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