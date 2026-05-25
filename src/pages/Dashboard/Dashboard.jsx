import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import api from "../../api/axiosInstance";
import "./Dashboard.css";


export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSeason, setActiveSeason] = useState(null);

  useEffect(() => {
    api.get("http://localhost:5001/api/seasons/active")
      .then(res => setActiveSeason(res.data))
      .catch(() => {});
  }, []);

  const [players,    setPlayers]    = useState([]);
  const [matches,    setMatches]    = useState([]);
  const [injuries,   setInjuries]   = useState([]);
  const [transfers,  setTransfers]  = useState([]);
  const [trainings,  setTrainings]  = useState([]);
  const [standings,  setStandings]  = useState([]);
  const [contracts,  setContracts]  = useState([]);
  const [tickerItems,setTickerItems]= useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/api/dashboard");
      setPlayers(res.data.players     || []);
      setMatches(res.data.matches     || []);
      setInjuries(res.data.injuries   || []);
      setTransfers(res.data.transfers || []);
      setTrainings(res.data.trainings || []);
      setStandings(res.data.standings || []);
      setContracts(res.data.contracts || []);
      setTickerItems(res.data.tickerItems || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getResult = (scoreH, scoreA) => {
    if (scoreH === scoreA) return { label: "B", cls: "warning" };
    return scoreH > scoreA
      ? { label: "F", cls: "success" }
      : { label: "H", cls: "danger" };
  };

  return (
    <div className="shell">

      <SideBar active="/dashboard" />

      <div className="main">

        <TopBar title="Dashboard i Klubit">
          {activeSeason && (
            <span style={{
              background: "#14532d", color: "#4ade80",
              borderRadius: 6, padding: "3px 10px",
              fontSize: 12, fontWeight: 600,
            }}>
              ● {activeSeason.emertimi}
            </span>
          )}
          <button className="btn btn-outline-secondary btn-sm">Eksporto</button>
        </TopBar>

        <div className="content">

        

          {/* STATS CARDS */}
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

            {/* PLAYERS TABLE */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Lojtarët — Skuadra</div>
                <div className="panel-action" onClick={() => navigate("/players")}>Shiko të gjithë →</div>
              </div>
              <div style={{ padding: "10px 18px" }}>
                <table className="table table-dark table-hover mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ fontSize: 10, textTransform: "uppercase", color: "#888" }}>
                      <th>Lojtar</th><th>Poz</th><th>Statusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="player-info">
                            <div className="p-num">{p.num ?? "—"}</div>
                            <div>
                              <div className="p-name">{p.name}</div>
                              <div className="p-pos">{p.pos}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-secondary">{p.badge}</span></td>
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

              {/* STANDINGS */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Tabela PL</div>
                </div>
                <div style={{ padding: "4px 18px" }}>
                  {standings.length === 0 ? (
                    <div style={{ color: "#666", fontSize: 12, padding: "8px 0" }}>Tabela nuk është e disponueshme</div>
                  ) : standings.map(s => (
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

            {/* MATCHES */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Ndeshjet e Fundit</div>
                <div className="panel-action" onClick={() => navigate("/Ndeshjet")}>Të gjitha →</div>
              </div>
              <div style={{ padding: "4px 18px" }}>
                {matches.length === 0 ? (
                  <div style={{ color: "#666", fontSize: 12, padding: "8px 0" }}>Nuk ka ndeshje të luajtura</div>
                ) : matches.map(m => {
                  const res = getResult(m.scoreH, m.scoreA);
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

              {/* INJURIES */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Dëmtimet Aktuale</div>
                  <div className="panel-action" onClick={() => navigate("/injuries")}>Shiko →</div>
                </div>
                <div style={{ padding: "4px 18px" }}>
                  {injuries.length === 0 ? (
                    <div style={{ color: "#666", fontSize: 12, padding: "8px 0" }}>Nuk ka dëmtime aktive</div>
                  ) : injuries.map(inj => (
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

              {/* CONTRACTS */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Kontratat — Alerte</div>
                </div>
                <div style={{ padding: "8px 18px" }}>
                  {contracts.length === 0 ? (
                    <div style={{ color: "#666", fontSize: 12, padding: "8px 0" }}>Nuk ka kontrata që skadojnë</div>
                  ) : contracts.map(c => (
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

            {/* TRAININGS */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Stërvitjet — Kjo Javë</div>
                <div className="panel-action" onClick={() => navigate("/training")}>Orari →</div>
              </div>
              <div style={{ padding: "4px 18px" }}>
                {trainings.length === 0 ? (
                  <div style={{ color: "#666", fontSize: 12, padding: "8px 0" }}>Nuk ka stërvitje të planifikuara</div>
                ) : trainings.map(t => (
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

            {/* TRANSFERS */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Transferimet — Aktive</div>
              </div>
              <div style={{ padding: "4px 18px" }}>
                {transfers.length === 0 ? (
                  <div style={{ color: "#666", fontSize: 12, padding: "8px 0" }}>Nuk ka transferime aktive</div>
                ) : transfers.map(t => (
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
