import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import "./PublicLineupPage.css";
import Navbar from "../Components/NavBar";
import { FORMATIONS } from "../Components/formations";

const RED = "#DA291C";

const POZ_COLOR = {
  Portier:   "#facc15",
  "Mbrojtës": "#60a5fa",
  Mesfushor: "#4ade80",
  Sulmues:   "#f87171",
};

function PitchLines() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox="0 0 100 160"
      preserveAspectRatio="none"
    >
      <rect x="2" y="2" width="96" height="156" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <line x1="2" y1="80" x2="98" y2="80" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <circle cx="50" cy="80" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <circle cx="50" cy="80" r="0.9" fill="rgba(255,255,255,0.5)" />
      <rect x="22" y="2"   width="56" height="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <rect x="35" y="2"   width="30" height="10" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <rect x="22" y="136" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <rect x="35" y="148" width="30" height="10" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <rect x="40" y="0"   width="20" height="3"  fill="none" stroke="rgba(255,255,255,0.4)"  strokeWidth="0.7" />
      <rect x="40" y="157" width="20" height="3"  fill="none" stroke="rgba(255,255,255,0.4)"  strokeWidth="0.7" />
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x="2" y={2 + i * 19.5} width="96" height="9.75"
          fill={i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"} />
      ))}
    </svg>
  );
}

function PlayerToken({ slot, player }) {
  const pc = player ? (POZ_COLOR[player.pozicioni] || "#fff") : "rgba(255,255,255,0.1)";
  return (
    <div className="plp-token" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
      <div
        className="plp-token-circle"
        style={{
          background:  player ? `linear-gradient(135deg, ${RED}, #a01010)` : "rgba(0,0,0,0.4)",
          border:      `2.5px solid ${pc}`,
          boxShadow:   player ? `0 0 14px ${pc}55, 0 3px 12px rgba(0,0,0,0.7)` : "none",
          opacity:     player ? 1 : 0.25,
        }}
      >
        {player
          ? <span className="plp-token-number">{player.numri_faneles ?? "?"}</span>
          : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>·</span>
        }
      </div>
      <div
        className="plp-token-name"
        style={{
          color:      player ? "#fff" : "transparent",
          background: player ? "rgba(0,0,0,0.55)" : "none",
          padding:    player ? "1px 4px" : 0,
        }}
      >
        {player ? player.mbiemri.toUpperCase() : ""}
      </div>
    </div>
  );
}

export default function PublicLineupPage() {
  const { matchId } = useParams();

  const [match,     setMatch]     = useState(null);
  const [lineup,    setLineup]    = useState({});
  const [bench,     setBench]     = useState([]);
  const [formation, setFormation] = useState("4-4-2");
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("fusha");

  useEffect(() => {
    Promise.all([
      api.get(`/api/ndeshjet/${matchId}`),
      api.get(`/api/lineup/${matchId}`),
    ])
      .then(([mRes, lRes]) => {
        setMatch(mRes.data);
        const { formacioni, titularet, rezervat } = lRes.data;
        setFormation(formacioni || "4-4-2");
        const lmap = {};
        for (const t of (titularet || [])) {
          if (t.slot_id) lmap[t.slot_id] = t;
        }
        setLineup(lmap);
        setBench(rezervat || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matchId]);

  const slots        = FORMATIONS[formation] || [];
  const titularet11  = Object.values(lineup);
  const titularCount = titularet11.length;
  const hasLineup    = titularCount > 0 || bench.length > 0;

  return (
    <div className="plp-page">

      {/* ══ NAVBAR ══ */}
      <div style={{ background: "#cc0000" }}>
        <Navbar />
      </div>


      {/* ══ LOADING ══ */}
      {loading && (
        <div className="plp-loading">
          <div className="plp-spinner" />
          <div className="plp-loading-text">Duke ngarkuar…</div>
        </div>
      )}

      {/* ══ EMPTY ══ */}
      {!loading && !hasLineup && (
        <div className="plp-empty">
          <div className="plp-empty-icon">📋</div>
          <div className="plp-empty-title">FORMACIONI NUK ËSHTË PUBLIKUAR</div>
          <div className="plp-empty-sub">Trajneri nuk ka caktuar lojtarët ende</div>
        </div>
      )}

      {/* ══ PERMBAJTJA ══ */}
      {!loading && hasLineup && (
        <>
          {/* Statistikat */}
          <div className="plp-stats-bar">
            {[
              { val: `${titularCount}/11`, label: "Titular", color: "#22c55e", icon: "👤" },
              { val: bench.length,         label: "Bankë",   color: "#eab308", icon: "🪑" },
            ].map(s => (
              <div key={s.label} className="plp-stat-item">
                <div className="plp-stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="plp-stat-label">{s.icon} {s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="plp-tabs">
            {[{ id: "fusha", label: "Formacioni" }, { id: "lista", label: "Lojtarët" }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`plp-tab${activeTab === tab.id ? " active" : ""}`}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="plp-content">

            {/* ════ TAB: FUSHA ════ */}
            {activeTab === "fusha" && (
              <div className="plp-layout">

                {/* Fusha */}
                <div className="plp-pitch-wrapper">
                  <div className="plp-pitch">
                    <PitchLines />
                    <div className="plp-pitch-formation-label">{formation}</div>
                    {slots.map(slot => (
                      <PlayerToken key={slot.id} slot={slot} player={lineup[slot.id] || null} />
                    ))}
                  </div>
                </div>

                {/* Panel djathtas */}
                <div className="plp-side-panel">

                  {/* Legenda */}
                  <div className="plp-legend-card">
                    <div className="plp-legend-title">Pozicionet</div>
                    {Object.entries(POZ_COLOR).map(([poz, color]) => {
                      const count = titularet11.filter(p => p.pozicioni === poz).length;
                      return (
                        <div key={poz} className="plp-legend-item">
                          <div className="plp-legend-dot" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
                          <span className="plp-legend-poz">{poz}</span>
                          {count > 0 && <span className="plp-legend-count" style={{ color }}>{count}</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Banka */}
                  {bench.length > 0 && (
                    <div className="plp-bench-card">
                      <div className="plp-bench-title">Bankë · {bench.length}</div>
                      <div className="plp-bench-list">
                        {bench.map(p => (
                          <div key={p.player_id} className="plp-bench-player">
                            <div className="plp-bench-num">{p.numri_faneles ?? "—"}</div>
                            <div style={{ minWidth: 0 }}>
                              <div className="plp-bench-player-name">{p.emri} {p.mbiemri}</div>
                              <div className="plp-bench-player-poz" style={{ color: POZ_COLOR[p.pozicioni] || "#888" }}>
                                {p.pozicioni}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════ TAB: LISTA ════ */}
            {activeTab === "lista" && (
              <div>

                {/* Titularet */}
                <div className="plp-section">
                  <div className="plp-section-header">
                    <div className="plp-section-bar" style={{ background: RED }} />
                    <span className="plp-section-title">TITULARET · {titularCount}/11</span>
                  </div>
                  <div className="plp-player-list">
                    {slots.filter(s => lineup[s.id]).map(slot => {
                      const p  = lineup[slot.id];
                      const pc = POZ_COLOR[p.pozicioni] || "#fff";
                      return (
                        <div key={slot.id} className="plp-player-row" style={{ borderLeft: `3px solid ${pc}` }}>
                          <div className="plp-player-num starter">{p.numri_faneles ?? "—"}</div>
                          <div className="plp-player-info">
                            <div className="plp-player-name">{p.emri} {p.mbiemri}</div>
                            <div className="plp-player-pos" style={{ color: pc }}>{p.pozicioni} · {slot.id}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Banka */}
                {bench.length > 0 && (
                  <div className="plp-section">
                    <div className="plp-section-header">
                      <div className="plp-section-bar" style={{ background: "#eab308" }} />
                      <span className="plp-section-title">BANKA · {bench.length}</span>
                    </div>
                    <div className="plp-player-list">
                      {bench.map(p => {
                        const pc = POZ_COLOR[p.pozicioni] || "#fff";
                        return (
                          <div key={p.player_id} className="plp-player-row bench-row">
                            <div className="plp-player-num bench">{p.numri_faneles ?? "—"}</div>
                            <div className="plp-player-info">
                              <div className="plp-player-name">{p.emri} {p.mbiemri}</div>
                              <div className="plp-player-pos" style={{ color: pc }}>{p.pozicioni}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
