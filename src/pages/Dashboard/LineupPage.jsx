import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import { FORMATIONS } from "../../Components/formations";
import "./Dashboard.css";

const RED   = "#DA291C";
const DARK  = "#0d0d0d";
const FH    = "'Bebas Neue', sans-serif";
const FB    = "'Barlow', sans-serif";

const POZ_COLOR = {
  Portier: "#facc15", "Mbrojtës": "#60a5fa", Mesfushor: "#4ade80", Sulmues: "#f87171",
};

/* ─── Vizatimi i vijave te fushe (SVG) ─────────────────────── */
function PitchLines() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox="0 0 100 160"
      preserveAspectRatio="none"
    >
      {/* Border */}
      <rect x="2" y="2" width="96" height="156" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      {/* Vija e mesit */}
      <line x1="2" y1="80" x2="98" y2="80" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      {/* Rrethi i mesit */}
      <circle cx="50" cy="80" r="12" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <circle cx="50" cy="80" r="0.8" fill="rgba(255,255,255,0.5)" />
      {/* Zona penalltise lart */}
      <rect x="22" y="2" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <rect x="35" y="2" width="30" height="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      {/* Zona penalltise poshte */}
      <rect x="22" y="136" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <rect x="35" y="148" width="30" height="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      {/* Porta lart */}
      <rect x="40" y="0" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      {/* Porta poshte */}
      <rect x="40" y="157" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
    </svg>
  );
}

/* ─── Token i lojtarit ne fushe ─────────────────────────────── */
function PlayerToken({ slot, player, isActive, readOnly, onClick }) {
  const empty  = !player;
  const pc     = player ? (POZ_COLOR[player.pozicioni] || "#fff") : "rgba(255,255,255,0.25)";
  const border = isActive ? "#fff" : empty ? "rgba(255,255,255,0.3)" : pc;

  return (
    <div
      onClick={readOnly ? undefined : onClick}
      style={{
        position: "absolute",
        left: `${slot.x}%`,
        top:  `${slot.y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: readOnly ? "default" : "pointer",
        zIndex: isActive ? 10 : 2,
        userSelect: "none",
      }}
    >
      {/* Fanella */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: empty ? "rgba(0,0,0,0.4)" : RED,
        border: `2px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: isActive ? "0 0 0 3px rgba(255,255,255,0.4)" : empty ? "none" : "0 2px 8px rgba(0,0,0,0.5)",
        transition: "all 0.15s",
      }}>
        {empty
          ? <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, lineHeight: 1 }}>+</span>
          : <span style={{ fontFamily: FH, fontSize: 15, color: "#fff", lineHeight: 1 }}>{player.numri_faneles ?? "?"}</span>
        }
      </div>
      {/* Emri */}
      <div style={{
        marginTop: 3, fontSize: 9, fontFamily: FB, fontWeight: 700,
        color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.9)",
        textAlign: "center", maxWidth: 64,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {empty ? slot.label : player.mbiemri.toUpperCase()}
      </div>
    </div>
  );
}

/* ─── Karta e lojtarit ne panel ─────────────────────────────── */
function PlayerCard({ p, isAssigned, isActive, onClick }) {
  const pc = POZ_COLOR[p.pozicioni] || "#fff";
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        background: isActive ? "rgba(218,41,28,0.15)" : isAssigned ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.04)",
        border: isActive ? "1px solid rgba(218,41,28,0.5)" : "1px solid rgba(255,255,255,0.06)",
        cursor: isAssigned ? "default" : "pointer",
        opacity: isAssigned ? 0.4 : 1,
        transition: "all 0.12s",
        marginBottom: 2,
      }}
      onMouseEnter={e => { if (!isAssigned) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={e => { if (!isAssigned) e.currentTarget.style.background = isActive ? "rgba(218,41,28,0.15)" : "rgba(255,255,255,0.04)"; }}
    >
      {/* Nr fanellës */}
      <div style={{
        width: 34, height: 34, background: isAssigned ? "#444" : RED, borderRadius: 4,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ fontFamily: FH, fontSize: 15, color: "#fff" }}>{p.numri_faneles ?? "—"}</span>
      </div>
      {/* Emri + pozicioni */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FH, fontSize: 15, color: "#fff", letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.emri} {p.mbiemri}
        </div>
        <div style={{ fontSize: 10, color: pc, fontFamily: FB, fontWeight: 700, letterSpacing: 1 }}>
          {p.pozicioni}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LINEUP PAGE — kryesor
═══════════════════════════════════════════════════════════════ */
export default function LineupPage() {
  const [match,      setMatch]      = useState(null);
  const [formation,  setFormation]  = useState("4-4-2");
  const [lineup,     setLineup]     = useState({});  // { slot_id: playerObj }
  const [bench,      setBench]      = useState([]);  // [playerObj]
  const [allPlayers, setAllPlayers] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [search,     setSearch]     = useState("");
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);

  const role = localStorage.getItem("role") || "";
  const readOnly = !["Admin", "Trajner"].includes(role);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ─── Fetch ─── */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const matchRes = await api.get("/api/ndeshjet/next-upcoming");
      const m = matchRes.data;
      setMatch(m);
      if (!m) return;

      const lineupRes = await api.get(`/api/lineup/${m.id}`);
      const { formacioni, titularet, rezervat, players } = lineupRes.data;

      setFormation(formacioni || "4-4-2");
      setAllPlayers(players || []);

      // Rinderto lineup map
      const lmap = {};
      for (const t of (titularet || [])) {
        if (t.slot_id) lmap[t.slot_id] = t;
      }
      setLineup(lmap);
      setBench(rezervat || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ─── IDs e lojtareve te caktuar ─── */
  const assignedIds = new Set([
    ...Object.values(lineup).map(p => p.player_id),
    ...bench.map(p => p.player_id),
  ]);

  /* ─── Klik ne slot te fushe ─── */
  const handleSlotClick = (slot) => {
    if (readOnly) return;
    if (activeSlot?.id === slot.id) {
      setActiveSlot(null);
      return;
    }
    setActiveSlot(slot);
    setSearch("");
  };

  /* ─── Zgjidh lojtarin per slot aktiv ─── */
  const handlePickPlayer = (player) => {
    if (!activeSlot || readOnly) return;

    // Nese ky slot kishte lojtar, ktheje te disponueshem
    setLineup(prev => {
      const updated = { ...prev };
      // Hiq nga slot tjeter nese lojtar ekziston atje
      for (const [sid, p] of Object.entries(updated)) {
        if (p.player_id === player.player_id) delete updated[sid];
      }
      updated[activeSlot.id] = player;
      return updated;
    });
    setBench(prev => prev.filter(p => p.player_id !== player.player_id));
    setActiveSlot(null);
  };

  /* ─── Largo lojtarin nga slot ─── */
  const handleRemoveFromSlot = (slotId, e) => {
    e.stopPropagation();
    if (readOnly) return;
    setLineup(prev => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  /* ─── Shto ne banke ─── */
  const handleAddToBench = (player) => {
    if (readOnly || assignedIds.has(player.player_id)) return;
    if (bench.length >= 7) { showToast("Banka maksimum 7 lojtarë", "error"); return; }
    setBench(prev => [...prev, player]);
    setActiveSlot(null);
  };

  /* ─── Largo nga banka ─── */
  const handleRemoveFromBench = (playerId) => {
    if (readOnly) return;
    setBench(prev => prev.filter(p => p.player_id !== playerId));
  };

  /* ─── Ndrysho formacionin ─── */
  const handleFormationChange = (f) => {
    if (readOnly) return;
    setFormation(f);
    setLineup({});
    setActiveSlot(null);
  };

  /* ─── Ruaj ─── */
  const handleSave = async () => {
    if (!match) return;
    setSaving(true);
    try {
      const titularet = Object.entries(lineup).map(([slot_id, p]) => ({
        slot_id, player_id: p.player_id,
      }));
      const rezervat = bench.map(p => ({ player_id: p.player_id }));
      await api.put(`/api/lineup/${match.id}`, { formacioni: formation, titularet, rezervat });
      showToast("Formacioni u ruajt me sukses!");
    } catch {
      showToast("Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Filtrim i lojtareve ne panel ─── */
  const slots        = FORMATIONS[formation] || [];
  const activeSlotDef = activeSlot ? slots.find(s => s.id === activeSlot.id) : null;
  const q            = search.trim().toLowerCase();

  const visiblePlayers = allPlayers.filter(p => {
    if (q && !`${p.emri} ${p.mbiemri}`.toLowerCase().includes(q) && !String(p.numri_faneles).includes(q)) return false;
    if (activeSlotDef && p.pozicioni !== activeSlotDef.poz) return false;
    return true;
  });

  /* ─── Statistikat e titulareve ─── */
  const titularet11 = Object.values(lineup).length;

  /* ─── Formatimi i dates ─── */
  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="shell">
      <SideBar active="/lineup" />

      <div className="main">
        <TopBar title={match ? `Formacioni · vs ${match.ekipi_kundershtare}` : "Formacioni"}>
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving || !match}
              className="btn btn-mu"
              style={{ opacity: saving || !match ? 0.5 : 1 }}
            >
              {saving ? "Duke ruajtur…" : "Ruaj Formacionin"}
            </button>
          )}
        </TopBar>

        <div className="content" style={{ background: DARK, padding: 0, fontFamily: FB }}>

          {loading ? (
            <div style={{ textAlign: "center", padding: 80, color: "#666" }}>Duke ngarkuar…</div>
          ) : !match ? (
            <div style={{ textAlign: "center", padding: 80, color: "#666" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <div style={{ fontFamily: FH, fontSize: 24, letterSpacing: 2, color: "rgba(255,255,255,0.3)" }}>
                NUK KA NDESHJE TË PLANIFIKUARA
              </div>
            </div>
          ) : (
            <>
              {/* ── Info ndeshja + formacioni selector ── */}
              <div style={{
                background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "16px 28px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
              }}>
                {/* Info ndeshja */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#666", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                    Ndeshja e ardhshme
                  </div>
                  <div style={{ fontFamily: FH, fontSize: 22, color: "#fff", letterSpacing: 1 }}>
                    Man United <span style={{ color: RED }}>vs</span> {match.ekipi_kundershtare}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                    {fmtDate(match.data_ndeshjes)}
                    {match.ora && ` · ${String(match.ora).slice(0, 5)}`}
                    {match.stadiumi && ` · ${match.stadiumi}`}
                  </div>
                </div>

                {/* Statistika te shpejta */}
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { val: `${titularet11}/11`, label: "Titular", color: "#22c55e" },
                    { val: bench.length,        label: "Bankë",   color: "#eab308" },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: FH, fontSize: 22, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Formacioni selector */}
                {!readOnly && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {Object.keys(FORMATIONS).map(f => (
                      <button
                        key={f}
                        onClick={() => handleFormationChange(f)}
                        style={{
                          padding: "6px 14px", fontFamily: FH, fontSize: 15, letterSpacing: 1,
                          background: formation === f ? "#fff" : "rgba(255,255,255,0.06)",
                          color: formation === f ? RED : "rgba(255,255,255,0.5)",
                          border: formation === f ? "1px solid #fff" : "1px solid rgba(255,255,255,0.1)",
                          cursor: "pointer", borderRadius: 0,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
                {readOnly && (
                  <div style={{ fontFamily: FH, fontSize: 20, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>
                    {formation}
                  </div>
                )}
              </div>

              {/* ── Layout kryesor ── */}
              <div style={{ display: "flex", gap: 0, height: "calc(100vh - 200px)", minHeight: 600 }}>

                {/* ── Fusha e futbollit ── */}
                <div style={{ flex: "0 0 58%", padding: "24px 20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Fusha */}
                  <div style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "138%",
                    background: "linear-gradient(180deg, #1a6b1a 0%, #1e7e1e 25%, #1a7518 50%, #1e7e1e 75%, #1a6b1a 100%)",
                    borderRadius: 4,
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
                  }}>
                    <PitchLines />

                    {/* Emertimi i formacionit */}
                    <div style={{
                      position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                      fontFamily: FH, fontSize: 14, color: "rgba(255,255,255,0.4)", letterSpacing: 3,
                    }}>
                      {formation}
                    </div>

                    {/* Slotsat e lojtareve */}
                    {slots.map(slot => {
                      const player    = lineup[slot.id];
                      const isActive  = activeSlot?.id === slot.id;
                      return (
                        <div key={slot.id} style={{ position: "absolute", inset: 0 }}>
                          <PlayerToken
                            slot={slot}
                            player={player}
                            isActive={isActive}
                            readOnly={readOnly}
                            onClick={() => handleSlotClick(slot)}
                          />
                          {/* X per me largo */}
                          {!readOnly && player && (
                            <div
                              onClick={(e) => handleRemoveFromSlot(slot.id, e)}
                              style={{
                                position: "absolute",
                                left: `${slot.x}%`,
                                top:  `${slot.y}%`,
                                transform: "translate(8px, -26px)",
                                width: 14, height: 14, borderRadius: "50%",
                                background: "#ff4d4d",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", zIndex: 20, fontSize: 9, color: "#fff", fontWeight: 700,
                              }}
                            >✕</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Banka */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#888", textTransform: "uppercase", marginBottom: 10 }}>
                      Bankë — {bench.length}/7
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {bench.map(p => (
                        <div key={p.player_id} style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "6px 10px",
                          background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 2,
                        }}>
                          <div style={{ fontFamily: FH, fontSize: 14, color: "#eab308" }}>#{p.numri_faneles ?? "—"}</div>
                          <div style={{ fontSize: 11, color: "#fff", fontFamily: FB, fontWeight: 600 }}>
                            {p.emri} {p.mbiemri}
                          </div>
                          {!readOnly && (
                            <button
                              onClick={() => handleRemoveFromBench(p.player_id)}
                              style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 11, padding: 0, marginLeft: 2 }}
                            >✕</button>
                          )}
                        </div>
                      ))}
                      {bench.length === 0 && (
                        <span style={{ fontSize: 12, color: "#555" }}>
                          {readOnly ? "Banka është bosh" : "Kliko 'Bankë' tek lojtarët për të shtuar"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Paneli djathtas: lojtaret ── */}
                <div style={{
                  flex: 1, borderLeft: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", flexDirection: "column", overflow: "hidden",
                }}>
                  {/* Header panel */}
                  <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {activeSlotDef ? (
                      <div>
                        <div style={{ fontFamily: FH, fontSize: 18, color: "#fff", letterSpacing: 1 }}>
                          Zgjedh për <span style={{ color: POZ_COLOR[activeSlotDef.poz] || RED }}>{activeSlot.id}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                          Pozicioni i sugjeruar: {activeSlotDef.poz}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontFamily: FH, fontSize: 18, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>
                        {readOnly ? "FORMACIONI" : "LOJTARËT — klikoni slot për të zgjedhur"}
                      </div>
                    )}

                    {/* Search */}
                    <div style={{
                      marginTop: 10, display: "flex", alignItems: "center", gap: 8,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      padding: "6px 12px",
                    }}>
                      <span style={{ color: "#666", fontSize: 13 }}>🔍</span>
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Kërko lojtar…"
                        style={{
                          background: "none", border: "none", outline: "none",
                          color: "#fff", fontFamily: FB, fontSize: 13, flex: 1,
                        }}
                      />
                      {search && (
                        <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>✕</button>
                      )}
                    </div>
                  </div>

                  {/* Lista lojtareve */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                    {visiblePlayers.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 40, color: "#555", fontSize: 13 }}>
                        Nuk ka lojtarë
                      </div>
                    ) : (
                      visiblePlayers.map(p => {
                        const isAssigned = assignedIds.has(p.player_id);
                        const isActive   = activeSlot && !isAssigned;
                        return (
                          <div key={p.player_id} style={{ padding: "0 8px" }}>
                            <PlayerCard
                              p={p}
                              isAssigned={isAssigned}
                              isActive={false}
                              onClick={() => {
                                if (isAssigned) return;
                                if (activeSlot) handlePickPlayer(p);
                              }}
                            />
                            {/* Butoni Bankë */}
                            {!readOnly && !isAssigned && !activeSlot && (
                              <button
                                onClick={() => handleAddToBench(p)}
                                style={{
                                  width: "100%", marginBottom: 2, padding: "3px 0",
                                  background: "rgba(234,179,8,0.06)",
                                  border: "1px solid rgba(234,179,8,0.15)",
                                  color: "#eab308", fontSize: 10, fontFamily: FB, fontWeight: 700,
                                  cursor: "pointer", letterSpacing: 1,
                                }}
                              >
                                + BANKË
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer panel — numri */}
                  <div style={{
                    padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontSize: 11, color: "#555", fontFamily: FB, fontWeight: 700, letterSpacing: 1,
                  }}>
                    {visiblePlayers.filter(p => !assignedIds.has(p.player_id)).length} lojtarë të disponueshëm
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            background: "#111", border: "1px solid rgba(255,255,255,0.1)",
            borderLeft: `4px solid ${toast.type === "error" ? "#ef4444" : "#22c55e"}`,
            padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, minWidth: 260,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <span style={{ color: "#fff", fontSize: 13, fontFamily: FB, fontWeight: 600 }}>{toast.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
