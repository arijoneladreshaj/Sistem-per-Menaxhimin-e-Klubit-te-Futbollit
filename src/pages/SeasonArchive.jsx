import { useState, useEffect } from "react";
import Navbar from "../Components/NavBar";
import api from "../api/axiosInstance";
import "./ManchesterUnitedHome.css";

const TABS = ["Statistika", "Ndeshjet", "Skuadra", "Tabela", "Top Scorer"];

const MOCK_STANDINGS = [
  { pozita: 1, ekipi: "Manchester City",  ndeshje: 38, fituar: 28, barazim: 5, humbur: 5, gola_f: 96, gola_m: 45, pike: 89 },
  { pozita: 2, ekipi: "Arsenal",          ndeshje: 38, fituar: 26, barazim: 6, humbur: 6, gola_f: 91, gola_m: 29, pike: 84 },
  { pozita: 3, ekipi: "Manchester United",ndeshje: 38, fituar: 23, barazim: 6, humbur: 9, gola_f: 57, gola_m: 38, pike: 75 },
  { pozita: 4, ekipi: "Newcastle United", ndeshje: 38, fituar: 19, barazim: 14,humbur: 5, gola_f: 68, gola_m: 33, pike: 71 },
  { pozita: 5, ekipi: "Liverpool",        ndeshje: 38, fituar: 19, barazim: 10,humbur: 9, gola_f: 75, gola_m: 47, pike: 67 },
  { pozita: 6, ekipi: "Brighton",         ndeshje: 38, fituar: 18, barazim: 8, humbur: 12,gola_f: 72, gola_m: 53, pike: 62 },
  { pozita: 7, ekipi: "Aston Villa",      ndeshje: 38, fituar: 18, barazim: 7, humbur: 13,gola_f: 51, gola_m: 46, pike: 61 },
  { pozita: 8, ekipi: "Tottenham",        ndeshje: 38, fituar: 17, barazim: 8, humbur: 13,gola_f: 65, gola_m: 52, pike: 59 },
];

const dayNames = ["E Diel","E Hënë","E Martë","E Mërkurë","E Enjte","E Premte","E Shtunë"];
const monthNames = ["Janar","Shkurt","Mars","Prill","Maj","Qershor","Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor"];

export default function SeasonArchive() {
  const [seasons, setSeasons]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab]           = useState("Statistika");
  const [stats, setStats]       = useState(null);
  const [matches, setMatches]   = useState([]);
  const [players, setPlayers]   = useState([]);
  const [loadingStats, setLoadingStats]   = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5001/api/seasons")
      .then(r => r.json())
      .then(d => {
        setSeasons(d);
        if (d.length > 0) selectSeason(d[0]);
      })
      .catch(() => {});

    api.get("http://localhost:5001/api/players")
      .then(r => setPlayers(r.data))
      .catch(() => {});
  }, []);

  const selectSeason = async (s) => {
    setSelected(s);
    setTab("Statistika");
    setStats(null);
    setMatches([]);

    setLoadingStats(true);
    try {
      const r = await fetch(`http://localhost:5001/api/seasons/${s.id}/stats`);
      const d = await r.json();
      setStats(d);
    } catch {}
    setLoadingStats(false);

    setLoadingMatches(true);
    try {
      const r = await api.get("http://localhost:5001/api/ndeshjet");
      const start = new Date(s.viti_fillimit);
      const end   = new Date(s.viti_perfundimit);
      const filtered = r.data.filter(m => {
        const d = new Date(m.data_ndeshjes);
        return d >= start && d <= end;
      });
      setMatches(filtered);
    } catch {}
    setLoadingMatches(false);
  };

  const mockTopScorers = [
    { name: "R. Højlund",   goals: 18, assists: 4,  img: null },
    { name: "B. Fernandes", goals: 12, assists: 9,  img: null },
    { name: "M. Rashford",  goals: 9,  assists: 7,  img: null },
    { name: "A. Martial",   goals: 6,  assists: 2,  img: null },
    { name: "J. Gallagher", goals: 4,  assists: 6,  img: null },
  ];

  const s = { background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 13 };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", fontFamily: "'Barlow',sans-serif" }}>
      <Navbar />

      {/* HERO */}
      <div style={{ position: "relative", minHeight: 260, display: "flex", alignItems: "flex-end", overflow: "hidden", background: "linear-gradient(135deg,#1a0000,#0a0a0a)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 60% 50%,rgba(218,41,28,0.07),transparent 60%)" }} />
        <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" alt="" style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", height: 200, opacity: 0.05 }} />
        <div style={{ position: "relative", zIndex: 2, padding: "40px 60px" }}>
          <div style={{ color: "#DA291C", fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>Manchester United FC</div>
          <h1 style={{ color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,7vw,80px)", margin: 0, letterSpacing: 3 }}>ARKIVA E SEZONEVE</h1>
          <p style={{ color: "#555", marginTop: 8, fontSize: 14 }}>Historia, statistikat dhe kujtimet e çdo sezoni</p>
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: 1300, margin: "0 auto", padding: "32px 24px", gap: 28 }}>

        {/* SIDEBAR — LISTA SEZONEVE */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Sezoned</div>
          {seasons.map(s => (
            <div
              key={s.id}
              onClick={() => selectSeason(s)}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 6,
                cursor: "pointer",
                background: selected?.id === s.id ? "rgba(218,41,28,0.12)" : "transparent",
                border: selected?.id === s.id ? "1px solid rgba(218,41,28,0.4)" : "1px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (selected?.id !== s.id) e.currentTarget.style.background = "#111"; }}
              onMouseLeave={e => { if (selected?.id !== s.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ color: selected?.id === s.id ? "#fff" : "#aaa", fontWeight: 700, fontSize: 15 }}>{s.emertimi}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                  background: s.statusi === "Aktiv" ? "#14532d" : s.statusi === "Mbyllur" ? "#3f1515" : "#1e3a5f",
                  color: s.statusi === "Aktiv" ? "#4ade80" : s.statusi === "Mbyllur" ? "#f87171" : "#60a5fa",
                }}>{s.statusi}</span>
                <span style={{ color: "#555", fontSize: 11 }}>{s.kompeticionit}</span>
              </div>
            </div>
          ))}
          {seasons.length === 0 && <div style={{ color: "#444", fontSize: 13 }}>Nuk ka sezone</div>}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <>
              {/* HEADER SEZONI */}
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ color: "#DA291C", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>Sezoni</div>
                  <div style={{ color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, letterSpacing: 2, lineHeight: 1 }}>{selected.emertimi}</div>
                  <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{selected.kompeticionit} · {selected.viti_fillimit?.split("T")[0]} → {selected.viti_perfundimit?.split("T")[0]}</div>
                </div>
                <span style={{
                  padding: "8px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14,
                  background: selected.statusi === "Aktiv" ? "#14532d" : "#1e1e1e",
                  color: selected.statusi === "Aktiv" ? "#4ade80" : "#888",
                  border: `1px solid ${selected.statusi === "Aktiv" ? "#4ade80" : "#2a2a2a"}`,
                }}>{selected.statusi}</span>
              </div>

              {/* TABS */}
              <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: tab === t ? "#DA291C" : "#111",
                    color: tab === t ? "#fff" : "#666",
                    transition: "all 0.2s",
                  }}>{t}</button>
                ))}
              </div>

              {/* ── TAB: STATISTIKA ── */}
              {tab === "Statistika" && (
                <div>
                  {loadingStats ? <div style={{ color: "#555", padding: 40, textAlign: "center" }}>Duke ngarkuar...</div> : stats ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                        {[
                          { label: "Ndeshje",  val: stats.played,  color: "#fff"     },
                          { label: "Fituar",   val: stats.wins,    color: "#4ade80"  },
                          { label: "Barazim",  val: stats.draws,   color: "#fbbf24"  },
                          { label: "Humbur",   val: stats.losses,  color: "#f87171"  },
                        ].map(c => (
                          <div key={c.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "24px 20px", textAlign: "center" }}>
                            <div style={{ color: c.color, fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, lineHeight: 1 }}>{c.val}</div>
                            <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginTop: 6 }}>{c.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                        {[
                          { label: "Gola Shënuar", val: stats.gf,     color: "#60a5fa" },
                          { label: "Gola Marrë",   val: stats.ga,     color: "#f87171" },
                          { label: "Diferenca",    val: (stats.gd > 0 ? "+" : "") + stats.gd, color: stats.gd >= 0 ? "#4ade80" : "#f87171" },
                          { label: "Pikë",         val: stats.points, color: "#DA291C" },
                        ].map(c => (
                          <div key={c.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "24px 20px", textAlign: "center" }}>
                            <div style={{ color: c.color, fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, lineHeight: 1 }}>{c.val}</div>
                            <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginTop: 6 }}>{c.label}</div>
                          </div>
                        ))}
                      </div>
                      {/* Forma */}
                      {stats.form?.length > 0 && (
                        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "20px 24px" }}>
                          <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>Forma e Fundit</div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {stats.form.map((f, i) => (
                              <div key={i} style={{ textAlign: "center" }}>
                                <div style={{
                                  width: 44, height: 44, borderRadius: 8,
                                  background: f.result === "W" ? "#14532d" : f.result === "D" ? "#713f12" : "#7f1d1d",
                                  color: f.result === "W" ? "#4ade80" : f.result === "D" ? "#fbbf24" : "#f87171",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontWeight: 900, fontSize: 18,
                                }}>{f.result}</div>
                                <div style={{ color: "#555", fontSize: 10, marginTop: 4 }}>{f.score}</div>
                                <div style={{ color: "#444", fontSize: 10 }}>{f.opponent?.slice(0,6)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : <div style={{ color: "#444", padding: 40, textAlign: "center" }}>Nuk ka statistika për këtë sezon</div>}
                </div>
              )}

              {/* ── TAB: NDESHJET ── */}
              {tab === "Ndeshjet" && (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" }}>
                  {loadingMatches ? <div style={{ color: "#555", padding: 40, textAlign: "center" }}>Duke ngarkuar...</div> :
                    matches.length === 0 ? <div style={{ color: "#444", padding: 40, textAlign: "center" }}>Nuk ka ndeshje për këtë sezon</div> :
                    matches.map(m => {
                      const d = m.data_ndeshjes ? new Date(m.data_ndeshjes) : null;
                      const played = m.statusi === "Luajtur";
                      const h = Number(m.rezultati_shtepia || 0);
                      const a = Number(m.rezultati_jashte || 0);
                      const res = !played ? null : h > a ? "W" : h < a ? "L" : "D";
                      return (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #1a1a1a", gap: 16 }}>
                          <div style={{ width: 80, flexShrink: 0 }}>
                            <div style={{ color: "#555", fontSize: 11 }}>{d ? dayNames[d.getDay()] : ""}</div>
                            <div style={{ color: "#aaa", fontSize: 13, fontWeight: 600 }}>{d ? `${d.getDate()} ${monthNames[d.getMonth()]}` : "—"}</div>
                          </div>
                          <span style={{ background: "#1e1e1e", color: "#888", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>
                            {m.lloji_kompeticionit || "PL"}
                          </span>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ color: "#DA291C", fontWeight: 700, fontSize: 14 }}>Man United</span>
                            <span style={{ color: "#555" }}>vs</span>
                            <span style={{ color: "#aaa", fontSize: 14 }}>{m.ekipi_kundershtare}</span>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", minWidth: 60, textAlign: "center" }}>
                            {played ? `${h} – ${a}` : m.ora ? String(m.ora).slice(0,5) : "TBD"}
                          </div>
                          {res && (
                            <div style={{
                              width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 800, fontSize: 13, flexShrink: 0,
                              background: res === "W" ? "#14532d" : res === "D" ? "#713f12" : "#7f1d1d",
                              color: res === "W" ? "#4ade80" : res === "D" ? "#fbbf24" : "#f87171",
                            }}>{res}</div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* ── TAB: SKUADRA ── */}
              {tab === "Skuadra" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                  {players.length === 0 ? <div style={{ color: "#444", padding: 40, gridColumn: "1/-1", textAlign: "center" }}>Nuk ka lojtarë</div> :
                    players.map(p => (
                      <div key={p.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#DA291C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 20, fontWeight: 800, color: "#fff" }}>
                          {p.numri_fanellës || "?"}
                        </div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{p.emri} {p.mbiemri}</div>
                        <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>{p.pozicioni || "—"}</div>
                        <div style={{ color: "#DA291C", fontSize: 11, marginTop: 4 }}>{p.kombesia || ""}</div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* ── TAB: TABELA ── */}
              {tab === "Tabela" && (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{selected.kompeticionit} {selected.emertimi}</span>
                    <span style={{ color: "#555", fontSize: 12 }}>* Të dhëna ilustruese</span>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#0d0d0d" }}>
                        {["Pos","Ekipi","Np","F","B","H","GF","GA","GD","Pikë"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", color: "#555", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: h === "Ekipi" ? "left" : "center" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_STANDINGS.map(r => {
                        const isUs = r.ekipi?.toLowerCase().includes("manchester united");
                        const gd = r.gola_f - r.gola_m;
                        return (
                          <tr key={r.pozita} style={{ background: isUs ? "rgba(218,41,28,0.08)" : "transparent", borderBottom: "1px solid #1a1a1a" }}>
                            <td style={{ padding: "12px", textAlign: "center", color: r.pozita <= 4 ? "#4ade80" : "#888", fontWeight: 700 }}>{r.pozita}</td>
                            <td style={{ padding: "12px", color: isUs ? "#DA291C" : "#fff", fontWeight: isUs ? 800 : 500 }}>{r.ekipi}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: "#888" }}>{r.ndeshje}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: "#4ade80" }}>{r.fituar}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: "#fbbf24" }}>{r.barazim}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: "#f87171" }}>{r.humbur}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: "#888" }}>{r.gola_f}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: "#888" }}>{r.gola_m}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: gd >= 0 ? "#4ade80" : "#f87171" }}>{gd > 0 ? `+${gd}` : gd}</td>
                            <td style={{ padding: "12px", textAlign: "center", color: "#fff", fontWeight: 800 }}>{r.pike}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── TAB: TOP SCORER ── */}
              {tab === "Top Scorer" && (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#fff", fontWeight: 700 }}>Golashënuesit — {selected.emertimi}</span>
                    <span style={{ color: "#555", fontSize: 12 }}>Të dhëna ilustruese</span>
                  </div>
                  {mockTopScorers.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1a1a1a", gap: 16 }}>
                      <div style={{ width: 32, fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: i === 0 ? "#fbbf24" : "#444", textAlign: "center" }}>{i + 1}</div>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: i === 0 ? "#DA291C" : "#1e1e1e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚽</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: 700 }}>{p.name}</div>
                        <div style={{ color: "#555", fontSize: 12 }}>Manchester United</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: "#DA291C", fontFamily: "'Bebas Neue',sans-serif", fontSize: 32 }}>{p.goals}</div>
                        <div style={{ color: "#555", fontSize: 10, textTransform: "uppercase" }}>Gola</div>
                      </div>
                      <div style={{ textAlign: "center", marginLeft: 16 }}>
                        <div style={{ color: "#60a5fa", fontFamily: "'Bebas Neue',sans-serif", fontSize: 32 }}>{p.assists}</div>
                        <div style={{ color: "#555", fontSize: 10, textTransform: "uppercase" }}>Asistime</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </>
          ) : (
            <div style={{ color: "#444", textAlign: "center", padding: 80, fontSize: 16 }}>Zgjidh një sezon nga lista</div>
          )}
        </div>
      </div>
    </div>
  );
}
