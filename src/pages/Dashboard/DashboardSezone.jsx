import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import "./Dashboard.css";

const API = "/api/seasons";

const KOMPETICIONET = ["Premier League", "FA Cup", "Champions League", "Europa League", "Tjetër"];
const STATUSET = ["Aktiv", "Mbyllur", "Ardhshëm"];

const STATUS_STYLE = {
  "Aktiv":    { background: "#14532d", color: "#4ade80" },
  "Mbyllur":  { background: "#3f1515", color: "#f87171" },
  "Ardhshëm": { background: "#1e3a5f", color: "#60a5fa" },
};

const emptyForm = {
  emertimi: "",
  viti_fillimit: "",
  viti_perfundimit: "",
  kompeticionit: "Premier League",
  statusi: "Ardhshëm",
};

const inp = {
  background: "#1a1a1a",
  border: "1px solid #333",
  color: "#fff",
  borderRadius: 8,
  padding: "8px 12px",
  width: "100%",
  fontSize: 13,
};

export default function DashboardSezone() {
  const [seasons, setSeasons] = useState([]);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(null);
  useEffect(() => { fetchSeasons(); }, []);
  useEffect(() => {
    if (msg) { const t = setTimeout(() => setMsg(""), 3000); return () => clearTimeout(t); }
  }, [msg]);

  const fetchSeasons = async () => {
    try {
      const res = await api.get(API);
      setSeasons(res.data);
      const active = res.data.find(s => s.statusi === "Aktiv");
      if (active) {
        const sRes = await api.get(`${API}/${active.id}/stats`);
        setStats(sRes.data);
      }
    } catch (e) { console.error(e); }
  };


  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setShow(true); };

  const openEdit = (s) => {
    setEditId(s.id);
    setForm({
      emertimi: s.emertimi || "",
      viti_fillimit: s.viti_fillimit ? s.viti_fillimit.split("T")[0] : "",
      viti_perfundimit: s.viti_perfundimit ? s.viti_perfundimit.split("T")[0] : "",
      kompeticionit: s.kompeticionit || "Premier League",
      statusi: s.statusi || "Ardhshëm",
    });
    setShow(true);
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.emertimi.trim() || !form.viti_fillimit || !form.viti_perfundimit)
      return setMsg("Plotëso fushat e detyrueshme!");
    try {
      if (editId) { await api.put(`${API}/${editId}`, form); setMsg("Sezoni u ndryshua!"); }
      else { await api.post(API, form); setMsg("Sezoni u shtua!"); }
      setShow(false);
      fetchSeasons();
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || "Gabim gjatë ruajtjes!");
    }
  };

  const handleActivate = async (id) => {
    try { await api.patch(`${API}/${id}/activate`); setMsg("Sezoni u vendos aktiv!"); fetchSeasons(); }
    catch (e) { setMsg("Gabim!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt?")) return;
    try { await api.delete(`${API}/${id}`); setMsg("Sezoni u fshi!"); fetchSeasons(); }
    catch (e) { setMsg("Gabim gjatë fshirjes!"); }
  };

  const filtered = seasons.filter((s) =>
    s.emertimi?.toLowerCase().includes(search.toLowerCase()) ||
    s.kompeticionit?.toLowerCase().includes(search.toLowerCase())
  );

  const activeSeason = seasons.find((s) => s.statusi === "Aktiv");

  return (
    <div className="shell">
      <SideBar active="/seasons" />
      <div className="main">
        <TopBar title="Menaxhimi i Sezoneve">
          <button className="btn btn-mu" onClick={openAdd}>+ Shto Sezon</button>
        </TopBar>

        <div className="content">
          {msg && <div className={`alert py-2 ${msg.includes("Gabim") ? "alert-danger" : "alert-success"}`}>{msg}</div>}

          {/* SEZONI AKTIV */}
          {activeSeason && (
            <div style={{ background: "linear-gradient(135deg,#14532d,#1a1a1a)", border: "1px solid #4ade80", borderRadius: 10, padding: "16px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", flexShrink: 0, boxShadow: "0 0 8px #4ade80" }} />
              <div>
                <div style={{ color: "#4ade80", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Sezoni Aktiv</div>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{activeSeason.emertimi}</div>
                <div style={{ color: "#888", fontSize: 12 }}>{activeSeason.kompeticionit}</div>
              </div>
            </div>
          )}

          {/* STATISTIKAT E SEZONIT AKTIV */}
          {stats && (
            <div className="panel" style={{ marginBottom: 24 }}>
              <div className="panel-header">
                <div className="panel-title">Statistikat e Sezonit Aktiv</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {stats.form.map((f, i) => (
                    <div key={i} title={`${f.opponent} ${f.score}`} style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: f.result === "W" ? "#14532d" : f.result === "D" ? "#713f12" : "#7f1d1d",
                      color: f.result === "W" ? "#4ade80" : f.result === "D" ? "#fbbf24" : "#f87171",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13, cursor: "default",
                    }}>{f.result}</div>
                  ))}
                  {stats.form.length > 0 && <span style={{ color: "#555", fontSize: 11, alignSelf: "center", marginLeft: 4 }}>forma e fundit</span>}
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr) 1px repeat(4,1fr)", gap: 0 }}>
                {[
                  { label: "Luajtura", val: stats.played, color: "#fff" },
                  { label: "Fituar",   val: stats.wins,   color: "#4ade80" },
                  { label: "Barazim",  val: stats.draws,  color: "#fbbf24" },
                  { label: "Humbur",   val: stats.losses, color: "#f87171" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ color: s.color, fontSize: 36, fontWeight: 800, fontFamily: "'Bebas Neue',sans-serif" }}>{s.val}</div>
                    <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                  </div>
                ))}
                <div style={{ background: "#2a2a2a", width: 1 }} />
                {[
                  { label: "Gola Shënuar", val: stats.gf,     color: "#60a5fa" },
                  { label: "Gola Marrë",   val: stats.ga,     color: "#f87171" },
                  { label: "Diferenca",    val: (stats.gd > 0 ? "+" : "") + stats.gd, color: stats.gd >= 0 ? "#4ade80" : "#f87171" },
                  { label: "Pikë",         val: stats.points, color: "#DA291C" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ color: s.color, fontSize: 36, fontWeight: 800, fontFamily: "'Bebas Neue',sans-serif" }}>{s.val}</div>
                    <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATS */}
          <div className="stats-row" style={{ marginBottom: 24 }}>
            {[
              { label: "Total", value: seasons.length, sub: "Të gjitha sezoned" },
              { label: "Aktiv", value: seasons.filter(s => s.statusi === "Aktiv").length, sub: "Sezoni aktual" },
              { label: "Mbyllur", value: seasons.filter(s => s.statusi === "Mbyllur").length, sub: "Sezone të kaluara" },
              { label: "Ardhshëm", value: seasons.filter(s => s.statusi === "Ardhshëm").length, sub: "Sezone të ardhshme" },
            ].map((c) => (
              <div className="stat-card" key={c.label}>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-sub">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* TABLE */}
          <div className="panel">
            <div className="panel-header" style={{ padding: "12px 18px" }}>
              <div className="panel-title">Lista e Sezoneve</div>
              <input placeholder="Kërko sezon..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inp, width: 220 }} />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table table-dark table-hover mb-0" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ fontSize: 11, textTransform: "uppercase", color: "#888" }}>
                    <th>#</th><th>Emërtimi</th><th>Fillimi</th><th>Përfundimi</th>
                    <th>Kompeticioni</th><th>Statusi</th><th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">Nuk ka sezone</td></tr>
                  ) : filtered.map((s) => (
                    <tr key={s.id}>
                      <td style={{ color: "#666" }}>{s.id}</td>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{s.emertimi}</td>
                      <td style={{ color: "#aaa" }}>{s.viti_fillimit ? new Date(s.viti_fillimit).toLocaleDateString("sq-AL") : "—"}</td>
                      <td style={{ color: "#aaa" }}>{s.viti_perfundimit ? new Date(s.viti_perfundimit).toLocaleDateString("sq-AL") : "—"}</td>
                      <td><span className="badge" style={{ background: "#DA291C" }}>{s.kompeticionit || "—"}</span></td>
                      <td><span className="badge" style={STATUS_STYLE[s.statusi] || {}}>{s.statusi}</span></td>
                      <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {s.statusi !== "Aktiv" && (
                          <button className="btn btn-sm" style={{ background: "#14532d", color: "#4ade80", border: "none", fontSize: 11 }} onClick={() => handleActivate(s.id)}>
                            Vendos Aktiv
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(s)}>Edito</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>Fshi</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {show && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #333" }}>
                <h5 className="modal-title" style={{ color: "#fff" }}>{editId ? "Edito Sezonin" : "Shto Sezon"}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShow(false)} />
              </div>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Informacion bazë */}
                <div style={{ color: "#DA291C", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Informacion Bazë</div>
                <div>
                  <label style={{ color: "#aaa", fontSize: 12, marginBottom: 4, display: "block" }}>Emërtimi *</label>
                  <input name="emertimi" value={form.emertimi} onChange={handleChange} placeholder="p.sh. 2026/27" style={inp} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12, marginBottom: 4, display: "block" }}>Data e Fillimit *</label>
                    <input type="date" name="viti_fillimit" value={form.viti_fillimit} onChange={handleChange} style={{ ...inp, colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12, marginBottom: 4, display: "block" }}>Data e Përfundimit *</label>
                    <input type="date" name="viti_perfundimit" value={form.viti_perfundimit} onChange={handleChange} style={{ ...inp, colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12, marginBottom: 4, display: "block" }}>Kompeticioni</label>
                    <select name="kompeticionit" value={form.kompeticionit} onChange={handleChange} style={inp}>
                      {KOMPETICIONET.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12, marginBottom: 4, display: "block" }}>Statusi</label>
                    <select name="statusi" value={form.statusi} onChange={handleChange} style={inp}>
                      {STATUSET.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

              </div>

              <div className="modal-footer" style={{ borderTop: "1px solid #333" }}>
                <button className="btn btn-secondary" onClick={() => setShow(false)}>Anulo</button>
                <button className="btn btn-danger" onClick={handleSave}>{editId ? "Ruaj Ndryshimet" : "Shto Sezonin"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
