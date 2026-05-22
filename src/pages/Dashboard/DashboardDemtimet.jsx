import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { Modal, Form, Row, Col } from "react-bootstrap";
import "./Dashboard.css";

const API         = "http://localhost:5001/api/injuries";
const PLAYERS_API = "http://localhost:5001/api/players";


const navLinks = [
  { section: "Kryesor",   items: [{ label: "Dashboard",    path: "/dashboard" }] },
  { section: "Menaxhim",  items: [{ label: "Lojtarët",     path: "/players",           badge: 6  },
                                   { label: "Store",        path: "/DashboardStore",    badge: 18 },
                                   { label: "Stafi",        path: "/staff",             badge: 4  },
                                   { label: "Ndeshjet",     path: "/dashboardNdeshjet", badge: 5  },
                                   { label: "Stërvitjet",   path: "/training",          badge: 4  }] },
  { section: "Financa",   items: [{ label: "Transferimet", path: "/transfers",          badge: 3  },
                                   { label: "Kontratat",    path: "/contracts",         badge: 4  }] },
  { section: "Analitikë", items: [{ label: "Dëmtimet",     path: "/injuries",           badge: 4  },
                                   { label: "Sezonet",      path: "/seasons",           badge: 3  },
                                   { label: "Klubet",       path: "/clubs",             badge: 3  }] },
];

const LLOJET = ["Muskulor", "Ligament", "Tendini", "Shtrëngim", "Thyerje", "Kokë", "Gjuri", "Shpine", "Tjetër"];
const STATUSET = ["Aktiv", "Rikuperim", "Shëruar"];

const LLOJI_COLOR = {
  Muskulor:   "#f97316",
  Ligament:   "#ef4444",
  Tendini:    "#eab308",
  Shtrëngim:  "#3b82f6",
  Thyerje:    "#b91c1c",
  Kokë:       "#a855f7",
  Gjuri:      "#ec4899",
  Shpine:     "#06b6d4",
  Tjetër:     "#6b7280",
};

const STATUSI_CLS = {
  Aktiv:     { bg: "#ef444420", border: "#ef4444", text: "#ef4444" },
  Rikuperim: { bg: "#eab30820", border: "#eab308", text: "#eab308" },
  Shëruar:   { bg: "#22c55e20", border: "#22c55e", text: "#22c55e" },
};

const emptyForm = {
  player_id:      "",
  lloji_demtimit: "Muskulor",
  pershkrimi:     "",
  data_demtimit:  "",
  data_rikthimit: "",
  statusi:        "Aktiv",
};

function recoveryPct(data_demtimit, data_rikthimit) {
  if (!data_demtimit || !data_rikthimit) return null;
  const start = new Date(data_demtimit).getTime();
  const end   = new Date(data_rikthimit).getTime();
  const now   = Date.now();
  if (end <= start) return null;
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  return Math.round(pct);
}

function daysUntilReturn(data_rikthimit) {
  if (!data_rikthimit) return null;
  const diff = Math.ceil((new Date(data_rikthimit).getTime() - Date.now()) / 86400000);
  return diff;
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  const months = ["Jan","Shk","Mar","Pri","Maj","Qer","Kor","Gus","Sht","Tet","Nën","Dhj"];
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

/* ── Injury Card ── */
function InjuryCard({ inj, onEdit, onDelete }) {
  const stCls  = STATUSI_CLS[inj.statusi] || STATUSI_CLS["Aktiv"];
  const lColor = LLOJI_COLOR[inj.lloji_demtimit] || "#6b7280";
  const pct    = recoveryPct(inj.data_demtimit, inj.data_rikthimit);
  const days   = daysUntilReturn(inj.data_rikthimit);

  return (
    <div style={{
      background: "#141414",
      border: `1px solid #2a2a2a`,
      borderLeft: `4px solid ${lColor}`,
      borderRadius: 8,
      padding: "16px 20px",
      marginBottom: 12,
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
    }}>
      {/* Player avatar */}
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "#1e1e1e", border: `2px solid ${lColor}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: lColor, flexShrink: 0,
      }}>
        {inj.numri_faneles || "?"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#f0f0f0" }}>
            {inj.emri_lojtarit}
          </span>
          <span style={{ fontSize: 11, color: "#888" }}>{inj.pozicioni}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
            background: `${lColor}20`, color: lColor, border: `1px solid ${lColor}40`,
          }}>
            {inj.lloji_demtimit}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
            background: stCls.bg, color: stCls.text, border: `1px solid ${stCls.border}40`,
            marginLeft: "auto",
          }}>
            {inj.statusi}
          </span>
        </div>

        {inj.pershkrimi && (
          <p style={{ fontSize: 13, color: "#999", marginBottom: 8, marginTop: 0 }}>
            {inj.pershkrimi}
          </p>
        )}

        <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#888", marginBottom: pct !== null ? 10 : 0 }}>
          <span>Dëmtuar: <strong style={{ color: "#ccc" }}>{fmtDate(inj.data_demtimit)}</strong></span>
          {inj.data_rikthimit && (
            <span>Kthim: <strong style={{ color: "#ccc" }}>{fmtDate(inj.data_rikthimit)}</strong></span>
          )}
          {days !== null && inj.statusi !== "Shëruar" && (
            <span style={{ color: days <= 7 ? "#22c55e" : days <= 14 ? "#eab308" : "#ef4444" }}>
              {days > 0 ? `${days} ditë deri kthim` : days === 0 ? "Kthehet sot" : "Vonuar"}
            </span>
          )}
        </div>

        {/* Recovery progress bar */}
        {pct !== null && inj.statusi !== "Shëruar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
              <span>Rikuperim</span>
              <span style={{ color: pct >= 75 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444" }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: "#2a2a2a", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: pct >= 75 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444",
                borderRadius: 4,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* CRUD buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(inj)} style={{
          background: "#1e1e1e", border: "1px solid #3a3a3a", color: "#60a5fa",
          borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
        <button onClick={() => onDelete(inj.id)} style={{
          background: "#1e1e1e", border: "1px solid #3a3a3a", color: "#ef4444",
          borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Fshi
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function DashboardDemtimet() {
  const navigate = useNavigate();
  const [injuries, setInjuries]   = useState([]);
  const [players,  setPlayers]    = useState([]);
  const [filter,   setFilter]     = useState("Të gjitha");
  const [search,   setSearch]     = useState("");
  const [show,     setShow]       = useState(false);
  const [editId,   setEditId]     = useState(null);
  const [form,     setForm]       = useState({ ...emptyForm });
  const [msg,      setMsg]        = useState({ text: "", type: "success" });

  useEffect(() => { fetchInjuries(); fetchPlayers(); }, []);
  useEffect(() => {
    if (msg.text) { const t = setTimeout(() => setMsg({ text: "", type: "success" }), 3500); return () => clearTimeout(t); }
  }, [msg]);

  const fetchInjuries = async () => {
    try { const r = await api.get(API); setInjuries(r.data); } catch (e) { console.error(e); }
  };

const fetchPlayers = async () => {
  try {
    const r = await api.get(PLAYERS_API);
    setPlayers(r.data);
  } catch (e) {
    console.error(e);
  }
};

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setShow(true); };

  const openEdit = (inj) => {
    setEditId(inj.id);
    setForm({
      player_id:      inj.player_id,
      lloji_demtimit: inj.lloji_demtimit,
      pershkrimi:     inj.pershkrimi || "",
      data_demtimit:  inj.data_demtimit?.split("T")[0] || "",
      data_rikthimit: inj.data_rikthimit?.split("T")[0] || "",
      statusi:        inj.statusi,
    });
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        player_id:      Number(form.player_id),
        lloji_demtimit: form.lloji_demtimit,
        pershkrimi:     form.pershkrimi || null,
        data_demtimit:  form.data_demtimit,
        data_rikthimit: form.data_rikthimit || null,
        statusi:        form.statusi,
      };
      if (editId) await api.put(`${API}/${editId}`, payload);
      else        await api.post(API, payload);
      setShow(false);
      fetchInjuries();
      setMsg({ text: editId ? "Dëmtimi u ndryshua me sukses!" : "Dëmtimi u shtua me sukses!", type: "success" });
    } catch (e) {
      setMsg({ text: "Gabim gjatë ruajtjes.", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish këtë dëmtim?")) return;
    try {
      await api.delete(`${API}/${id}`);
      fetchInjuries();
      setMsg({ text: "Dëmtimi u fshi me sukses!", type: "success" });
    } catch (e) {
      setMsg({ text: "Gabim gjatë fshirjes.", type: "error" });
    }
  };

  /* Stats */
  const total     = injuries.length;
  const aktive    = injuries.filter(i => i.statusi === "Aktiv").length;
  const rikuperim = injuries.filter(i => i.statusi === "Rikuperim").length;
  const sheruar   = injuries.filter(i => i.statusi === "Shëruar").length;

  /* Filtered list */
  const filtered = injuries.filter(i => {
    const matchFilter = filter === "Të gjitha" || i.statusi === filter;
    const matchSearch = i.emri_lojtarit?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statCards = [
    { label: "Totali",    value: total,     color: "#f0f0f0", icon: "🩹" },
    { label: "Aktive",    value: aktive,    color: "#ef4444", icon: "🔴" },
    { label: "Rikuperim", value: rikuperim, color: "#eab308", icon: "🟡" },
    { label: "Shëruar",   value: sheruar,   color: "#22c55e", icon: "🟢" },
  ];

  const tabs = ["Të gjitha", "Aktiv", "Rikuperim", "Shëruar"];

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
                  className={`nav-item${item.path === "/injuries" ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="nav-dot" />
                  {item.label}
                  {item.badge && (
                    <span className="badge ms-auto" style={{ background: "#DA291C" }}>{item.badge}</span>
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

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">Menaxhimi i Dëmtimeve</div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-mu" onClick={openAdd}>+ Shto Dëmtim</button>
            <div className="avatar">AK</div>
          </div>
        </div>

        <div className="content">

          {/* Alert */}
          {msg.text && (
            <div style={{
              background: msg.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${msg.type === "success" ? "#22c55e" : "#ef4444"}`,
              color: msg.type === "success" ? "#22c55e" : "#ef4444",
              borderRadius: 8, padding: "12px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 20,
            }}>
              <span>{msg.text}</span>
              <button onClick={() => setMsg({ text: "", type: "success" })} style={{ background: "none", border: "none", color: "inherit", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
          )}

          {/* Stats cards */}
          <div className="stats-row" style={{ marginBottom: 24 }}>
            {statCards.map(card => (
              <div className="stat-card" key={card.label}>
                <div className="stat-label">{card.icon} {card.label}</div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-sub">Lojtarë</div>
              </div>
            ))}
          </div>

          {/* Filter tabs + Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: "1px solid",
                  borderColor: filter === t ? "#DA291C" : "#2a2a2a",
                  background: filter === t ? "rgba(218,41,28,0.15)" : "#141414",
                  color: filter === t ? "#fff" : "#888",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  {t}
                  {t !== "Të gjitha" && (
                    <span style={{
                      marginLeft: 6, fontSize: 11,
                      background: filter === t ? "#DA291C" : "#2a2a2a",
                      borderRadius: 10, padding: "1px 6px",
                    }}>
                      {injuries.filter(i => i.statusi === t).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kërko lojtar..."
              style={{
                background: "#141414", border: "1px solid #2a2a2a",
                color: "#f0f0f0", borderRadius: 6, padding: "6px 14px",
                fontSize: 13, outline: "none", minWidth: 180,
              }}
            />
          </div>

          {/* Injury list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
              {injuries.length === 0
                ? "Nuk ka dëmtime të regjistruara. Shtyp \"+ Shto Dëmtim\" për të filluar."
                : "Asnjë dëmtim nuk u gjet për këtë filtër."}
            </div>
          ) : (
            filtered.map(inj => (
              <InjuryCard key={inj.id} inj={inj} onEdit={openEdit} onDelete={handleDelete} />
            ))
          )}

        </div>
      </div>

      {/* MODAL — Add / Edit */}
      <Modal show={show} onHide={() => setShow(false)} centered size="lg" className="staff-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Ndrysho Dëmtimin" : "Shto Dëmtim të Ri"}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label>Lojtari</Form.Label>
                <Form.Select name="player_id" value={form.player_id} onChange={handleChange} required>
                  <option value="">-- Zgjidh Lojtarin --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      #{p.numri_faneles} {p.emri} {p.mbiemri} — {p.pozicioni}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Lloji i Dëmtimit</Form.Label>
                <Form.Select name="lloji_demtimit" value={form.lloji_demtimit} onChange={handleChange} required>
                  {LLOJET.map(l => <option key={l} value={l}>{l}</option>)}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Statusi</Form.Label>
                <Form.Select name="statusi" value={form.statusi} onChange={handleChange}>
                  {STATUSET.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Data e Dëmtimit</Form.Label>
                <Form.Control type="date" name="data_demtimit" value={form.data_demtimit} onChange={handleChange} required />
              </Col>

              <Col md={6}>
                <Form.Label>Data e Kthimit (opsionale)</Form.Label>
                <Form.Control type="date" name="data_rikthimit" value={form.data_rikthimit} onChange={handleChange} />
              </Col>

              <Col md={12}>
                <Form.Label>Përshkrimi (opsional)</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  name="pershkrimi"
                  value={form.pershkrimi}
                  onChange={handleChange}
                  placeholder="Shkruaj detaje rreth dëmtimit..."
                />
              </Col>

              {/* Preview of recovery bar if dates are set */}
              {form.data_demtimit && form.data_rikthimit && (() => {
                const pct = recoveryPct(form.data_demtimit, form.data_rikthimit);
                if (pct === null) return null;
                return (
                  <Col md={12}>
                    <Form.Label>Parashikim i Rikuperimit</Form.Label>
                    <div style={{ background: "#1e1e1e", borderRadius: 6, padding: "10px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 6 }}>
                        <span>{fmtDate(form.data_demtimit)}</span>
                        <span style={{ color: pct >= 75 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444", fontWeight: 600 }}>{pct}% rikuperim</span>
                        <span>{fmtDate(form.data_rikthimit)}</span>
                      </div>
                      <div style={{ height: 8, background: "#2a2a2a", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 4,
                          background: pct >= 75 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444",
                        }} />
                      </div>
                    </div>
                  </Col>
                );
              })()}
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <button type="button" className="btn btn-delete" onClick={() => setShow(false)}>Anulo</button>
            <button type="submit" className="btn btn-mu">
              {editId ? "Ruaj Ndryshimet" : "Shto Dëmtimin"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
