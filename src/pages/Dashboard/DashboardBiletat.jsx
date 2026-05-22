import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import SideBar from "../../Components/SideBar";
import "./Dashboard.css";
import { SECTOR_CONFIG, isVipSeat, getSeatPrice } from "../BuyTicketsPage/SectorConfig/sectorConfig";

const API         = "http://localhost:5001/api/tickets";
const MATCHES_API = "http://localhost:5001/api/ndeshjet";

const STATUSET = ["E shitur", "E rezervuar", "E lire"];
const SEKTORET = ["lindje", "perendim", "veri", "jug"];

const STATUS_COLOR = {
  "E shitur":    { bg: "#166534", color: "#4ade80" },
  "E rezervuar": { bg: "#713f12", color: "#fbbf24" },
  "E lire":      { bg: "#1e3a5f", color: "#60a5fa" },
};

const emptyForm = {
  match_id: "", sektori: "lindje", numri_uleses: "",
  emri_bleresit: "", mbiemri_bleresit: "", cmimi: "", is_vip: false, statusi: "E shitur",
};

export default function DashboardBiletat() {
  const [tickets,  setTickets]  = useState([]);
  const [matches,  setMatches]  = useState([]);
  const [filter,   setFilter]   = useState("Të gjitha");
  const [search,   setSearch]   = useState("");
  const [msg,      setMsg]      = useState("");
  const [show,     setShow]     = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState({ ...emptyForm });

  useEffect(() => { fetchTickets(); fetchMatches(); }, []);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(""), 3000); return () => clearTimeout(t); } }, [msg]);

  const fetchTickets = async () => {
    try { const res = await api.get(API); setTickets(res.data); } catch (e) { console.error(e); }
  };

  const fetchMatches = async () => {
    try { const res = await api.get(MATCHES_API); setMatches(res.data); } catch (e) { console.error(e); }
  };

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setShow(true); };

  const openEdit = (t) => {
    setEditId(t.id);
    setForm({
      match_id:         t.match_id        || "",
      sektori:          t.sektori         || "lindje",
      numri_uleses:     t.numri_uleses    || "",
      emri_bleresit:    t.emri_bleresit   || "",
      mbiemri_bleresit: t.mbiemri_bleresit|| "",
      cmimi:            t.cmimi           || "",
      is_vip:           !!t.is_vip,
      statusi:          t.statusi         || "E shitur",
    });
    setShow(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.match_id || !form.numri_uleses || !form.cmimi)
      return setMsg("Plotëso fushat e detyrueshme!");

    const cfg      = SECTOR_CONFIG[form.sektori];
    const seatNum  = Number(form.numri_uleses);
    const maxSeats = cfg.rows * cfg.cols;

    if (seatNum < 1 || seatNum > maxSeats)
      return setMsg(`Ulësja duhet të jetë mes 1 dhe ${maxSeats} për sektorin "${form.sektori}"!`);

    if (form.is_vip && cfg.vipRows.length === 0)
      return setMsg(`Sektori "${form.sektori}" nuk ka ulëse VIP!`);

    const finalForm = { ...form, cmimi: String(form.cmimi) };

    try {
      if (editId) {
        await api.put(`${API}/${editId}`, finalForm);
        setMsg("Bileta u ndryshua!");
      } else {
        await api.post(API, {
          match_id: Number(finalForm.match_id),
          seats: [{
            sectorName:  finalForm.sektori,
            seatNumber:  Number(finalForm.numri_uleses),
            firstName:   finalForm.emri_bleresit,
            lastName:    finalForm.mbiemri_bleresit,
            price:       Number(finalForm.cmimi),
            isVip:       finalForm.is_vip,
            statusi:     finalForm.statusi,
          }],
        });
        setMsg("Bileta u shtua!");
      }
      setShow(false);
      fetchTickets();
    } catch (e) { setMsg("Gabim gjatë ruajtjes!"); }
  };

  const handleStatusChange = async (id, statusi) => {
    try {
      await api.put(`${API}/${id}`, { statusi });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, statusi } : t));
      setMsg("Statusi u ndryshua!");
    } catch (e) { setMsg("Gabim!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt?")) return;
    try {
      await api.delete(`${API}/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
      setMsg("Bileta u fshi!");
    } catch (e) { setMsg("Gabim!"); }
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === "Të gjitha" || t.statusi === filter;
    const matchSearch = search === "" ||
      t.ekipi_kundershtare?.toLowerCase().includes(search.toLowerCase()) ||
      t.emri_bleresit?.toLowerCase().includes(search.toLowerCase()) ||
      t.mbiemri_bleresit?.toLowerCase().includes(search.toLowerCase()) ||
      t.sektori?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total:      tickets.length,
    shitur:     tickets.filter(t => t.statusi === "E shitur").length,
    rezervuar:  tickets.filter(t => t.statusi === "E rezervuar").length,
    te_ardhura: tickets.filter(t => t.statusi === "E shitur").reduce((s, t) => s + Number(t.cmimi || 0), 0),
  };

  const inp = { background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: 8, padding: "8px 12px", width: "100%", fontSize: 13 };

  return (
    <div className="shell">
      <SideBar active="/DashboardBiletat" />

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">Menaxhimi i Biletave</div>
          <button className="btn btn-danger btn-sm" onClick={openAdd}>+ Shto Biletë</button>
        </div>

        <div className="content">
          {msg && <div className={`alert py-2 ${msg.includes("Gabim") ? "alert-danger" : "alert-success"}`}>{msg}</div>}

          {/* STATS */}
          <div className="stats-row" style={{ marginBottom: 24 }}>
            {[
              { label: "Total",      value: stats.total,                        sub: "Të gjitha biletat" },
              { label: "Të shitura", value: stats.shitur,                       sub: "Bileta të blera" },
              { label: "Rezervuar",  value: stats.rezervuar,                    sub: "Bileta të rezervuara" },
              { label: "Të ardhura", value: `€${stats.te_ardhura.toFixed(0)}`, sub: "Nga shitjet" },
            ].map(c => (
              <div className="stat-card" key={c.label}>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-sub">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div className="panel">
            <div className="panel-header" style={{ padding: "12px 18px", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Të gjitha", ...STATUSET].map(s => (
                  <button key={s} onClick={() => setFilter(s)} style={{
                    padding: "4px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
                    background: filter === s ? "#DA291C" : "#2a2a2a",
                    color: filter === s ? "#fff" : "#aaa",
                  }}>
                    {s} {s !== "Të gjitha" && `(${tickets.filter(t => t.statusi === s).length})`}
                  </button>
                ))}
              </div>
              <input
                placeholder="Kërko ndeshje, blerës, sektor..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inp, minWidth: 220, width: "auto" }}
              />
            </div>

            {/* TABLE */}
            <div style={{ overflowX: "auto" }}>
              <table className="table table-dark table-hover mb-0" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ fontSize: 11, textTransform: "uppercase", color: "#888" }}>
                    <th>#</th><th>Ndeshja</th><th>Data</th><th>Sektori</th>
                    <th>Ulëse</th><th>VIP</th><th>Blerësi</th><th>Çmimi</th>
                    <th>Statusi</th><th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} className="text-center text-muted py-4">Nuk ka bileta</td></tr>
                  ) : filtered.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: "#666" }}>{t.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>Man United vs {t.ekipi_kundershtare || "—"}</div>
                        <div style={{ fontSize: 11, color: "#666" }}>{t.stadiumi || ""}</div>
                      </td>
                      <td style={{ color: "#aaa" }}>
                        {t.data_ndeshjes ? new Date(t.data_ndeshjes).toLocaleDateString("sq-AL") : "—"}
                      </td>
                      <td><span className="badge bg-secondary">{t.sektori}</span></td>
                      <td style={{ fontWeight: 600 }}>{t.numri_uleses}</td>
                      <td>{t.is_vip ? <span className="badge" style={{ background: "#7c3aed" }}>VIP</span> : "—"}</td>
                      <td>
                        {t.emri_bleresit || t.mbiemri_bleresit
                          ? `${t.emri_bleresit || ""} ${t.mbiemri_bleresit || ""}`.trim()
                          : <span style={{ color: "#555" }}>—</span>}
                        {t.user_email && <div style={{ fontSize: 11, color: "#666" }}>{t.user_email}</div>}
                      </td>
                      <td style={{ color: "#4ade80", fontWeight: 600 }}>€{Number(t.cmimi).toFixed(2)}</td>
                      <td>
                        <select value={t.statusi} onChange={e => handleStatusChange(t.id, e.target.value)}
                          style={{
                            background: STATUS_COLOR[t.statusi]?.bg || "#1a1a1a",
                            color: STATUS_COLOR[t.statusi]?.color || "#fff",
                            border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 12, cursor: "pointer",
                          }}>
                          {STATUSET.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(t)}>Edito</button>
                        <button className="btn btn-sm btn-outline-danger"  onClick={() => handleDelete(t.id)}>Fshi</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SHTO / EDITO */}
      {show && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #333" }}>
                <h5 className="modal-title" style={{ color: "#fff" }}>
                  {editId ? "Edito Biletën" : "Shto Biletë"}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShow(false)} />
              </div>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                <div>
                  <label style={{ color: "#aaa", fontSize: 12 }}>Ndeshja *</label>
                  <select name="match_id" value={form.match_id} onChange={handleChange} style={inp}>
                    <option value="">-- Zgjidh ndeshjen --</option>
                    {matches.map(m => (
                      <option key={m.id} value={m.id}>
                        Man United vs {m.ekipi_kundershtare} — {new Date(m.data_ndeshjes).toLocaleDateString("sq-AL")}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Sektori *</label>
                    <select name="sektori" value={form.sektori} onChange={handleChange} style={inp}>
                      {SEKTORET.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Nr. Ulëses *</label>
                    <input type="number" name="numri_uleses" value={form.numri_uleses} onChange={handleChange} style={inp} min={1} />
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Emri</label>
                    <input name="emri_bleresit" value={form.emri_bleresit} onChange={handleChange} style={inp} />
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Mbiemri</label>
                    <input name="mbiemri_bleresit" value={form.mbiemri_bleresit} onChange={handleChange} style={inp} />
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Çmimi (€) *</label>
                    <input type="number" name="cmimi" value={form.cmimi} onChange={handleChange} style={inp} min={0} step="0.01" />
                  </div>
                  <div>
                    <label style={{ color: "#aaa", fontSize: 12 }}>Statusi</label>
                    <select name="statusi" value={form.statusi} onChange={handleChange} style={inp}>
                      {STATUSET.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {(() => {
                  const sectorHasVip = SECTOR_CONFIG[form.sektori]?.vipRows?.length > 0;
                  return (
                    <label style={{ color: sectorHasVip ? "#aaa" : "#555", fontSize: 13, display: "flex", alignItems: "center", gap: 8, cursor: sectorHasVip ? "pointer" : "not-allowed" }}>
                      <input type="checkbox" name="is_vip" checked={form.is_vip} onChange={handleChange} disabled={!sectorHasVip} />
                      VIP {!sectorHasVip && <span style={{ fontSize: 11 }}>(sektori nuk ka VIP)</span>}
                    </label>
                  );
                })()}
              </div>

              <div className="modal-footer" style={{ borderTop: "1px solid #333" }}>
                <button className="btn btn-secondary" onClick={() => setShow(false)}>Anulo</button>
                <button className="btn btn-danger" onClick={handleSave}>
                  {editId ? "Ruaj Ndryshimet" : "Shto Biletën"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
