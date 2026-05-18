import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const players = [
  { id:1, num:8,  name:"B. Fernandes", pos:"Mesfushë", badge:"CAM", goals:12, assists:9,  rating:8.4, ratingCls:"high", status:"Aktiv",   statusCls:"success" },
  { id:2, num:9,  name:"R. Højlund",   pos:"Sulmues",  badge:"ST",  goals:18, assists:4,  rating:8.1, ratingCls:"high", status:"Aktiv",   statusCls:"success" },
  { id:3, num:23, name:"L. Shaw",      pos:"Mbrojtës", badge:"LB",  goals:1,  assists:5,  rating:7.2, ratingCls:"mid",  status:"Kujdes",  statusCls:"warning" },
  { id:4, num:5,  name:"H. Maguire",   pos:"Mbrojtës", badge:"CB",  goals:3,  assists:1,  rating:6.8, ratingCls:"mid",  status:"Aktiv",   statusCls:"success" },
  { id:5, num:25, name:"M. Rashford",  pos:"Sulmues",  badge:"LW",  goals:9,  assists:7,  rating:7.5, ratingCls:"mid",  status:"Aktiv",   statusCls:"success" },
  { id:6, num:18, name:"C. Gallagher", pos:"Mesfushë", badge:"CM",  goals:4,  assists:6,  rating:6.3, ratingCls:"low",  status:"Dëmtuar", statusCls:"danger"  },
];

const matches = [
  { id:1, date:"Prill 22", comp:"PL",  home:"Man United", away:"Arsenal",   scoreH:2, scoreA:1 },
  { id:2, date:"Prill 17", comp:"PL",  home:"Tottenham",  away:"Man United", scoreH:1, scoreA:1 },
  { id:3, date:"Prill 10", comp:"UEL", home:"Man United", away:"Lyon",      scoreH:3, scoreA:0 },
  { id:4, date:"Prill 5",  comp:"PL",  home:"Everton",    away:"Man United", scoreH:2, scoreA:3 },
  { id:5, date:"Mars 30",  comp:"PL",  home:"Man United", away:"West Ham",  scoreH:0, scoreA:1 },
];

const injuries = [
  { id:1, player:"C. Gallagher",   type:"Muskulor",  eta:"~3 javë", cls:"danger"  },
  { id:2, player:"A. Wan-Bissaka", type:"Ligament",  eta:"~6 javë", cls:"danger"  },
  { id:3, player:"L. Shaw",        type:"Tendini",   eta:"~1 javë", cls:"warning" },
  { id:4, player:"T. Mainoo",      type:"Shtrëngim", eta:"~2 javë", cls:"warning" },
];

const contracts = [
  { id:1, player:"M. Rashford", end:"Qer 2025", cls:"red"    },
  { id:2, player:"H. Maguire",  end:"Qer 2026", cls:"yellow" },
  { id:3, player:"L. Shaw",     end:"Dhj 2025", cls:"yellow" },
];

const trainings = [
  { id:1, date:"Hën 28 Prill", time:"09:00", type:"Taktikë & Pozicionim",  loc:"Carrington", color:"#60a5fa" },
  { id:2, date:"Mar 29 Prill", time:"10:30", type:"Forcë & Kondicion",      loc:"Sallë",      color:"#4ade80" },
  { id:3, date:"Mër 30 Prill", time:"09:00", type:"Set Piece Stërvitje",    loc:"Carrington", color:"#DA291C" },
  { id:4, date:"Enj 1 Maj",    time:"11:00", type:"Pushim & Rikuperim",     loc:"Carrington", color:"#fbbf24" },
];

const transfers = [
  { id:1, player:"S. Gyökeres",  from:"Sporting CP", to:"Man United", amount:"£85M", type:"in"  },
  { id:2, player:"F. Pellistri", from:"Man United",  to:"Genoa",      amount:"£12M", type:"out" },
  { id:3, player:"R. Fresneda",  from:"Valladolid",  to:"Man United", amount:"£10M", type:"in"  },
];

const standings = [
  { pos:1, name:"Liverpool",  pts:74 },
  { pos:2, name:"Arsenal",    pts:67 },
  { pos:3, name:"Man United", pts:58, isUs:true },
  { pos:4, name:"Chelsea",    pts:54 },
  { pos:5, name:"Man City",   pts:51 },
];

const tickerItems = [
  "Chelsea LIVE · 20:00",
  "Tabela: United 3. vend me 58 pikë",
  "Goli i javës: Bruno Fernandes vs Tottenham",
  "Man United 2 – 1 Arsenal · Premier League",
  "Transferim: Rashford kthehet në formë",
];

const navLinks = [
  { section: "Kryesor",   items: [{ label: "Dashboard",    path: "/dashboard" }] },
  { section: "Menaxhim",  items: [{ label: "Lojtarët",     path: "/DashboardPlayers",   badge: 6  },
                                  { label: "Store", path: "/DashboardStore", badge: 18 },
                                   { label: "Stafi",        path: "/staff",     badge: 4  },
                                   { label: "Ndeshjet",     path: "/dashboardNdeshjet",   badge: 5  },
                                   { label: "Stërvitjet",   path: "/training",  badge: 4  }] },
  { section: "Financa",   items: [{ label: "Transferimet", path: "/transfers", badge: 3  },
                                   { label: "Kontratat",    path: "/contracts", badge: 4  }] },
  { section: "Analitikë", items: [{ label: "Dëmtimet",     path: "/injuries",  badge: 4  },
                                   { label: "Sezonet",      path: "/seasons",   badge: 3  },
                                   { label: "Klubet",       path: "/clubs",     badge: 3  }] },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const getResult = (home, away, scoreH, scoreA) => {
    const muHome = home === "Man United";
    if (scoreH === scoreA) return { label: "B", cls: "warning" };
    if (muHome) return scoreH > scoreA ? { label: "F", cls: "success" } : { label: "H", cls: "danger" };
    return scoreA > scoreH ? { label: "F", cls: "success" } : { label: "H", cls: "danger" };
  };

  return (
    <div className="shell">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-area">
          <div className="crest">MU</div>
          <div className="club-name">Manchester<span>United FC</span></div>
        </div>

        <nav className="flex-grow-1 overflow-auto py-2">
          {navLinks.map(group => (
            <React.Fragment key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map(item => (
                <div
                  key={item.path}
                  className={`nav-item${item.path === "/dashboard" ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="nav-dot" />
                  {item.label}
                  {item.badge && (
                    <span className="badge ms-auto" style={{ background: "#DA291C" }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="badge fw-bold" style={{ background: "#FBE122", color: "#000" }}>2025/26</span>
          <span style={{ fontSize: 11, color: "#888" }}>Premier League</span>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">

        <div className="topbar">
          <div className="topbar-title">Dashboard i Klubit</div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm">Eksporto</button>
            <div className="avatar">AK</div>
          </div>
        </div>

        <div className="content">

          <div className="ticker">
            <div className="ticker-label">Live</div>
            <div className="ticker-track">
              <div className="ticker-inner">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="ticker-item">
                    {item} <span className="ticker-sep">|</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="stats-row">
            {[
              { label: "Lojtarë",    value: players.length,   sub: "Skuadra aktive",       change: "↑ 2 nga janari",     up: true  },
              { label: "Pikë Sezon", value: "58",              sub: "32 ndeshje · Vendi 3", change: "↑ 3 pozita",         up: true  },
              { label: "Buxheti",    value: "£84M",            sub: "Transferime verore",   change: "↓ £16M shpenzuar",   up: false },
              { label: "Dëmtime",    value: injuries.length,   sub: "Lojtarë jashtë",       change: "↑ 1 javën e kaluar", up: false },
            ].map(card => (
              <div className="stat-card" key={card.label}>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-sub">{card.sub}</div>
                <div className={`fw-bold mt-1 text-${card.up ? "success" : "danger"}`} style={{ fontSize: 11 }}>
                  {card.change}
                </div>
              </div>
            ))}
          </div>

          <div className="grid3">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Lojtarët — Top Formë</div>
                <div className="panel-action" onClick={() => navigate("/players")}>Shiko të gjithë →</div>
              </div>
              <div style={{ padding: "10px 18px" }}>
                <table className="table table-dark table-hover mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ fontSize: 10, textTransform: "uppercase", color: "#888" }}>
                      <th>Lojtar</th><th>Poz</th>
                      <th className="text-center">Gola</th>
                      <th className="text-center">Asis</th>
                      <th className="text-center">Nota</th>
                      <th>Statusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="player-info">
                            <div className="p-num">{p.num}</div>
                            <div>
                              <div className="p-name">{p.name}</div>
                              <div className="p-pos">{p.pos}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-secondary">{p.badge}</span></td>
                        <td className="text-center fw-bold text-white">{p.goals}</td>
                        <td className="text-center" style={{ color: "#888" }}>{p.assists}</td>
                        <td className="text-center">
                          <span className={`rating ${p.ratingCls}`}>{p.rating}</span>
                        </td>
                        <td><span className={`badge bg-${p.statusCls}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="right-col">
              {/* NEXT MATCH */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Ndeshja Tjetër</div>
                  <div className="panel-action" onClick={() => navigate("/Ndeshjet")}>Shiko →</div>
                </div>
                <div className="next-match-body">
                  <div className="next-match-comp">Premier League · Javë 33</div>
                  <div className="next-match-teams">
                    <div>
                      <div className="team-crest">MU</div>
                      <div className="team-label">Man United</div>
                    </div>
                    <div className="vs-label">VS</div>
                    <div>
                      <div className="team-crest team-crest--cfc">CFC</div>
                      <div className="team-label">Chelsea</div>
                    </div>
                  </div>
                  <div className="next-match-time">Sot · 20:00 · Old Trafford</div>
                </div>
              </div>

          
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Tabela PL</div>
                </div>
                <div style={{ padding: "4px 18px" }}>
                  {standings.map(s => (
                    <div className="row-item" key={s.pos}>
                      <div className={`stand-pos${s.pos <= 3 ? " top3" : ""}`}>{s.pos}</div>
                      <div className={`stand-name${s.isUs ? " mu" : ""}`}>{s.name}</div>
                      <div className="stand-pts">{s.pts}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid2">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Ndeshjet e Fundit</div>
                <div className="panel-action" onClick={() => navigate("/Ndeshjet")}>Të gjitha →</div>
              </div>
              <div style={{ padding: "4px 18px" }}>
                {matches.map(m => {
                  const res = getResult(m.home, m.away, m.scoreH, m.scoreA);
                  return (
                    <div className="row-item" key={m.id}>
                      <div className="match-date">{m.date}<span style={{ display: "block" }}>{m.comp}</span></div>
                      <div className="match-teams">
                        <strong>{m.home}</strong>
                        <span>vs {m.away}</span>
                      </div>
                      <div className="match-score">{m.scoreH}-{m.scoreA}</div>
                      <span className={`badge bg-${res.cls}`}>{res.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="right-col">
        
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Dëmtimet Aktuale</div>
                  <div className="panel-action" onClick={() => navigate("/injuries")}>Shiko →</div>
                </div>
                <div style={{ padding: "4px 18px" }}>
                  {injuries.map(inj => (
                    <div className="row-item" key={inj.id}>
                      <div className="inj-dot" style={{ background: inj.cls === "danger" ? "#f87171" : "#fbbf24" }} />
                      <div className="inj-info">
                        <div className="inj-name">{inj.player}</div>
                        <div className="inj-type">{inj.type}</div>
                      </div>
                      <div className="inj-eta">{inj.eta}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Kontratat — Alerte</div>
                  <div className="panel-action" onClick={() => navigate("/contracts")}>Shiko →</div>
                </div>
                <div style={{ padding: "8px 18px" }}>
                  {contracts.map(c => (
                    <div className={`alert-item alert-${c.cls}`} key={c.id}>
                      <div className="alert-dot" />
                      <div className="alert-text">{c.player}</div>
                      <div className="alert-date">{c.end}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid2">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Stërvitjet — Kjo Javë</div>
                <div className="panel-action" onClick={() => navigate("/training")}>Orari →</div>
              </div>
              <div style={{ padding: "4px 18px" }}>
                {trainings.map(t => (
                  <div className="row-item" key={t.id}>
                    <div className="train-time">{t.date}<br />{t.time}</div>
                    <div className="train-dot" style={{ background: t.color }} />
                    <div className="item-info">
                      <strong>{t.type}</strong>
                      <span>{t.loc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Transferimet — Aktive</div>
                <div className="panel-action" onClick={() => navigate("/transfers")}>Shiko →</div>
              </div>
              <div style={{ padding: "4px 18px" }}>
                {transfers.map(t => (
                  <div className="row-item" key={t.id}>
                    <div className={`tr-dir tr-${t.type}`}>{t.type === "in" ? "↓" : "↑"}</div>
                    <div className="item-info">
                      <strong>{t.player}</strong>
                      <span>{t.from} → {t.to}</span>
                    </div>
                    <div className="tr-amount">{t.amount}</div>
                  </div>
                ))}
                <div className="budget-row">
                  <span className="budget-label">Buxheti i mbetur</span>
                  <span className="budget-value">£68M</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}