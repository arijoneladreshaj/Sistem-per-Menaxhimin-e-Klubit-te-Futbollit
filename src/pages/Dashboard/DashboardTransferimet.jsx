import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axiosInstance";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Dashboard.css";

const API         = "/api/transfers";
const PLAYERS_API = "/api/players";

const RED    = "#cc0000";
const DARK   = "#1a0000";
const FONT_H = "'Bebas Neue', sans-serif";
const FONT_B = "'Barlow', sans-serif";

const LLOJET   = ["Blerje", "Shitje", "Huazim"];
const STATUSET = ["Konfirmuar", "Në proces", "Anuluar"];

const LLOJI_COLOR = {
  Blerje:  { bg: "rgba(74,222,128,0.15)",  fg: "#4ade80" },
  Shitje:  { bg: "rgba(248,113,113,0.15)", fg: "#f87171" },
  Huazim:  { bg: "rgba(250,204,21,0.15)",  fg: "#facc15" },
};

const STA_COLOR = {
  Konfirmuar:  { bg: "rgba(74,222,128,0.15)",  fg: "#4ade80"  },
  "Në proces": { bg: "rgba(96,165,250,0.15)",  fg: "#60a5fa"  },
  Anuluar:     { bg: "rgba(255,255,255,0.08)", fg: "rgba(255,255,255,0.4)" },
};

if (!document.getElementById("mu-transfers-fonts")) {
  const l = document.createElement("link");
  l.id   = "mu-transfers-fonts";
  l.rel  = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap";
  document.head.appendChild(l);
}

function fmtShuma(v) {
  const n = parseFloat(v);
  if (!n) return "—";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });
}

const INPUT = (err) => ({
  background: "rgba(255,255,255,0.06)",
  border: err ? "1.5px solid #ff4d4d" : "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontFamily: FONT_B, fontSize: 14, borderRadius: 0, padding: "10px 14px",
});
const LABEL = {
  fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1.5,
  color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 6,
};

/* ═══════════════════════════════════════════════════════════════════
   TRANSFER MODAL
═══════════════════════════════════════════════════════════════════ */
const EMPTY = {
  player_id: "", klubi_nisjes: "", klubi_destinacionit: "",
  shuma: "", data_transferimit: "", lloji: "Blerje", statusi: "Konfirmuar", shenimet: "",
};

function TransferModal({ transfer, players, onSave, onClose, saving }) {
  const isEdit = !!transfer?.id;
  const [form, setForm] = useState(transfer ? {
    ...transfer,
    data_transferimit: transfer.data_transferimit?.split("T")[0] || "",
  } : { ...EMPTY });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.player_id)         e.player_id        = "Zgjedh lojtarin";
    if (!form.data_transferimit) e.data_transferimit = "Data kërkohet";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...form, shuma: form.shuma ? +form.shuma : null });
  };

  const lc = LLOJI_COLOR[form.lloji] || LLOJI_COLOR["Blerje"];

  return (
    <>
      <div onClick={onClose} className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.75)", zIndex: 1000 }} />
      <div className="position-fixed d-flex flex-column"
        style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          zIndex: 1001, width: "95%", maxWidth: 580, maxHeight: "92vh",
          background: DARK, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden" }}>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ background: "rgba(0,0,0,0.45)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${isEdit ? "bi-pencil-square" : "bi-arrow-left-right"}`} style={{ color: "#fff", fontSize: 18 }} />
            <span style={{ fontFamily: FONT_H, fontSize: 22, letterSpacing: 2, color: "#fff" }}>
              {isEdit ? "EDITO TRANSFERIMIN" : "SHTO TRANSFERIM TË RI"}
            </span>
          </div>
          <button onClick={onClose} className="btn border-0 bg-transparent text-white"><i className="bi bi-x-lg" /></button>
        </div>

        <div className="overflow-auto px-4 py-4" style={{ flex: 1 }}>

          {/* Lojtari */}
          <div className="mb-3">
            <label style={LABEL}>Lojtari *</label>
            <select className="form-select" style={INPUT(errors.player_id)}
              value={form.player_id} onChange={e => set("player_id", e.target.value)}>
              <option value="">— Zgjedh lojtarin —</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.numri_faneles} {p.emri} {p.mbiemri} · {p.pozicioni}
                </option>
              ))}
            </select>
            {errors.player_id && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.player_id}</small>}
          </div>

          {/* Lloji + Statusi */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Lloji</label>
              <select className="form-select" style={{ ...INPUT(false), color: lc.fg }}
                value={form.lloji} onChange={e => set("lloji", e.target.value)}>
                {LLOJET.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label style={LABEL}>Statusi</label>
              <select className="form-select" style={INPUT(false)}
                value={form.statusi} onChange={e => set("statusi", e.target.value)}>
                {STATUSET.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Klubi nisjes → Destinacioni */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>
                <i className="bi bi-arrow-up-circle me-1" style={{ color: "#f87171" }} />
                Klubi Nisjes
              </label>
              <input className="form-control" style={INPUT(false)}
                value={form.klubi_nisjes || ""} onChange={e => set("klubi_nisjes", e.target.value)}
                placeholder="p.sh. Manchester United" />
            </div>
            <div className="col-6">
              <label style={LABEL}>
                <i className="bi bi-arrow-down-circle me-1" style={{ color: "#4ade80" }} />
                Klubi Destinacionit
              </label>
              <input className="form-control" style={INPUT(false)}
                value={form.klubi_destinacionit || ""} onChange={e => set("klubi_destinacionit", e.target.value)}
                placeholder="p.sh. Real Madrid" />
            </div>
          </div>

          {/* Data + Shuma */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Data e Transferimit *</label>
              <input type="date" className="form-control" style={INPUT(errors.data_transferimit)}
                value={form.data_transferimit} onChange={e => set("data_transferimit", e.target.value)} />
              {errors.data_transferimit && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.data_transferimit}</small>}
            </div>
            <div className="col-6">
              <label style={LABEL}>Shuma (€)</label>
              <input type="number" step="100000" className="form-control" style={INPUT(false)}
                value={form.shuma || ""} onChange={e => set("shuma", e.target.value)}
                placeholder="p.sh. 85000000" />
              {form.shuma > 0 && (
                <small style={{ color: "#facc15", fontSize: 11 }}>{fmtShuma(form.shuma)}</small>
              )}
            </div>
          </div>

          {/* Shënime */}
          <div className="mb-1">
            <label style={LABEL}>Shënime</label>
            <textarea className="form-control" style={{ ...INPUT(false), resize: "none" }} rows={3}
              value={form.shenimet || ""} onChange={e => set("shenimet", e.target.value)}
              placeholder="Detaje shtesë, klauzola, opsione..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 d-flex gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.45)" }}>
          <button onClick={onClose} className="btn flex-fill"
            style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontFamily: FONT_B, fontWeight: 700, fontSize: 13, letterSpacing: 1, borderRadius: 0, padding: "12px 0" }}>
            ANULO
          </button>
          <button onClick={submit} disabled={saving} className="btn flex-fill fw-bold"
            style={{ background: "#fff", color: RED, fontFamily: FONT_H, fontSize: 16, letterSpacing: 2, border: "none", borderRadius: 0, padding: "12px 0", opacity: saving ? 0.6 : 1 }}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />DUKE RUAJTUR...</> : isEdit ? "PËRDITËSO" : "SHTO TRANSFERIMIN"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DELETE MODAL
═══════════════════════════════════════════════════════════════════ */
function DeleteModal({ transfer, onConfirm, onClose, deleting }) {
  return (
    <>
      <div onClick={onClose} className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.75)", zIndex: 1000 }} />
      <div className="position-fixed p-4"
        style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1002, width: 400, background: DARK, border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="text-center">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{ width: 64, height: 64, background: "rgba(255,77,77,0.15)" }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: 28, color: "#ff4d4d" }} />
          </div>
          <h5 style={{ fontFamily: FONT_H, fontSize: 24, color: "#fff", letterSpacing: 1 }}>FSHI TRANSFERIMIN?</h5>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: FONT_B, marginBottom: 24 }}>
            Je i sigurt për transferimin e <strong style={{ color: "#fff" }}>{transfer.emri_lojtarit}</strong>?
          </p>
          <div className="d-flex gap-2">
            <button onClick={onClose} className="btn flex-fill"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontFamily: FONT_B, fontWeight: 700, fontSize: 13, borderRadius: 0, padding: "12px 0" }}>
              ANULO
            </button>
            <button onClick={() => onConfirm(transfer.id)} disabled={deleting} className="btn flex-fill fw-bold"
              style={{ background: "#ff4d4d", color: "#fff", fontFamily: FONT_H, fontSize: 16, letterSpacing: 2, border: "none", borderRadius: 0, padding: "12px 0", opacity: deleting ? 0.6 : 1 }}>
              {deleting ? <><span className="spinner-border spinner-border-sm me-2" />DUKE FSHIRË...</> : <><i className="bi bi-trash3 me-2" />FSHI</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════ */
export default function DashboardTransferimet() {
  const [transfers, setTransfers] = useState([]);
  const [players,   setPlayers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterLloji, setFilterLloji] = useState("Të gjitha");
  const [filterSta,   setFilterSta]   = useState("Të gjitha");

  const [modalTransfer, setModalTransfer] = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchTransfers = () => {
    setLoading(true);
    api.get(API)
      .then(r => setTransfers(r.data))
      .catch(() => showToast("Gabim gjatë marrjes së transferimeve", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransfers();
    api.get(PLAYERS_API).then(r => setPlayers(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await api.post(API, data);
      showToast("Transferimi u shtua!"); setModalTransfer(null); fetchTransfers();
    } catch (err) { showToast(err.response?.data?.error || "Gabim gjatë shtimit", "error"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await api.put(`${API}/${data.id}`, data);
      showToast("Transferimi u përditësua!"); setModalTransfer(null); fetchTransfers();
    } catch (err) { showToast(err.response?.data?.error || "Gabim gjatë përditësimit", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`${API}/${id}`);
      showToast("Transferimi u fshi!"); setDeleteTarget(null); fetchTransfers();
    } catch { showToast("Gabim gjatë fshirjes", "error"); }
    finally { setDeleting(false); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transfers.filter(t => {
      const matchLloji = filterLloji === "Të gjitha" || t.lloji   === filterLloji;
      const matchSta   = filterSta   === "Të gjitha" || t.statusi === filterSta;
      const matchQ     = !q || (t.emri_lojtarit || "").toLowerCase().includes(q)
        || (t.klubi_nisjes || "").toLowerCase().includes(q)
        || (t.klubi_destinacionit || "").toLowerCase().includes(q);
      return matchLloji && matchSta && matchQ;
    });
  }, [transfers, search, filterLloji, filterSta]);

  const blerje   = transfers.filter(t => t.lloji === "Blerje"  && t.statusi === "Konfirmuar").length;
  const shitje   = transfers.filter(t => t.lloji === "Shitje"  && t.statusi === "Konfirmuar").length;
  const huazim   = transfers.filter(t => t.lloji === "Huazim").length;
  const totalIn  = transfers.filter(t => t.lloji === "Blerje").reduce((s,t) => s + (+t.shuma||0), 0);
  const totalOut = transfers.filter(t => t.lloji === "Shitje").reduce((s,t) => s + (+t.shuma||0), 0);

  const statCards = [
    { icon: "bi-arrow-down-circle", label: "BLERJE",     value: blerje,           color: "#4ade80" },
    { icon: "bi-arrow-up-circle",   label: "SHITJE",     value: shitje,           color: "#f87171" },
    { icon: "bi-arrow-left-right",  label: "HUAZIME",    value: huazim,           color: "#facc15" },
    { icon: "bi-currency-euro",     label: "BILANCI",    value: fmtShuma(totalIn - totalOut), color: totalIn >= totalOut ? "#4ade80" : "#f87171" },
  ];

  return (
    <div className="shell">
      <SideBar active="/transfers" />
      <div className="main">
        <TopBar title="Menaxhimi i Transferimeve">
          <button onClick={() => setModalTransfer({})} className="btn btn-sm"
            style={{ background: RED, color: "#fff", border: "none", fontWeight: 600 }}>
            + Shto Transferim
          </button>
        </TopBar>

        <div className="content" style={{ background: `linear-gradient(135deg, ${DARK} 0%, #2d0000 50%, ${DARK} 100%)`, fontFamily: FONT_B }}>
          <div className="px-4 py-4" style={{ maxWidth: 1400, margin: "0 auto" }}>

            {/* STAT CARDS */}
            <div className="row g-3 mb-4">
              {statCards.map(s => (
                <div key={s.label} className="col-6 col-md-3">
                  <div className="p-3 h-100" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 15 }} />
                      <span style={{ fontFamily: FONT_B, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{s.label}</span>
                    </div>
                    <div style={{ fontFamily: FONT_H, fontSize: 32, color: s.color, letterSpacing: 1, lineHeight: 1 }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* FILTERS */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4 p-3"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="d-flex align-items-center gap-2" style={{ flex: "1 1 200px" }}>
                <i className="bi bi-search" style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }} />
                <input className="form-control border-0"
                  style={{ background: "transparent", color: "#fff", fontFamily: FONT_B, fontSize: 14, boxShadow: "none" }}
                  placeholder="Kërko lojtar, klub..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && (
                  <button onClick={() => setSearch("")} className="btn border-0 bg-transparent p-0"
                    style={{ color: "rgba(255,255,255,0.3)" }}><i className="bi bi-x" /></button>
                )}
              </div>
              <div className="d-flex gap-1 flex-wrap">
                {["Të gjitha", ...LLOJET].map(lloji => {
                  const lc = LLOJI_COLOR[lloji];
                  const active = filterLloji === lloji;
                  return (
                    <button key={lloji} onClick={() => setFilterLloji(lloji)} className="btn"
                      style={{ background: active && lc ? lc.bg : "rgba(255,255,255,0.04)", color: active && lc ? lc.fg : "rgba(255,255,255,0.4)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, border: active && lc ? `1px solid ${lc.fg}44` : "1px solid rgba(255,255,255,0.08)", padding: "5px 14px" }}>
                      {lloji}
                    </button>
                  );
                })}
              </div>
              <div className="d-flex gap-1 flex-wrap">
                {["Të gjitha", ...STATUSET].map(sta => {
                  const sc = STA_COLOR[sta];
                  const active = filterSta === sta;
                  return (
                    <button key={sta} onClick={() => setFilterSta(sta)} className="btn"
                      style={{ background: active && sc ? sc.bg : "rgba(255,255,255,0.04)", color: active && sc ? sc.fg : "rgba(255,255,255,0.4)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, border: active && sc ? `1px solid ${sc.fg}44` : "1px solid rgba(255,255,255,0.08)", padding: "5px 14px" }}>
                      {sta}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TABLE */}
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>

              {/* Header */}
              <div className="d-none d-md-flex align-items-center px-3 py-2"
                style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[["LOJTARI",3],["LLOJI",1.5],["NISJA → DESTINACIONI",3],["DATA",1.5],["SHUMA",1.5],["STATUSI",1.5],["",1.5]].map(([lbl,flex]) => (
                  <div key={lbl} style={{ flex, fontFamily: FONT_B, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                    {lbl}
                  </div>
                ))}
              </div>

              {loading && <div className="text-center py-5"><span className="spinner-border" style={{ color: RED }} /></div>}

              {!loading && filtered.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-arrow-left-right" style={{ fontSize: 48, color: "rgba(255,255,255,0.1)" }} />
                  <p className="mt-3 mb-0" style={{ fontFamily: FONT_H, fontSize: 20, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>
                    ASNJË TRANSFERIM
                  </p>
                  {!search && filterLloji === "Të gjitha" && filterSta === "Të gjitha" && (
                    <button onClick={() => setModalTransfer({})} className="btn mt-3"
                      style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", fontFamily: FONT_B, fontWeight: 700, fontSize: 12, letterSpacing: 1, borderRadius: 0, padding: "10px 24px" }}>
                      + SHTO TRANSFERIMIN E PARË
                    </button>
                  )}
                </div>
              )}

              {!loading && filtered.map(t => {
                const lc = LLOJI_COLOR[t.lloji] || LLOJI_COLOR["Blerje"];
                const sc = STA_COLOR[t.statusi]  || STA_COLOR["Anuluar"];
                return (
                  <div key={t.id} className="d-flex flex-wrap flex-md-nowrap align-items-center px-3 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", borderLeft: `3px solid ${lc.fg}66` }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                    {/* Lojtari */}
                    <div className="d-flex align-items-center gap-3" style={{ flex: 3, minWidth: 0 }}>
                      <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 40, height: 40, background: RED, borderRadius: 4 }}>
                        <span style={{ fontFamily: FONT_H, fontSize: 16, color: "#fff" }}>{t.numri_faneles ?? "—"}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: FONT_H, fontSize: 16, color: "#fff", letterSpacing: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.emri_lojtarit}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: FONT_B }}>{t.pozicioni}</div>
                      </div>
                    </div>

                    {/* Lloji */}
                    <div style={{ flex: 1.5 }}>
                      <span style={{ background: lc.bg, color: lc.fg, border: `1px solid ${lc.fg}44`, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>
                        {t.lloji === "Blerje" ? "↓ " : t.lloji === "Shitje" ? "↑ " : "⇄ "}{t.lloji}
                      </span>
                    </div>

                    {/* Nisja → Destinacioni */}
                    <div style={{ flex: 3 }}>
                      <div style={{ fontSize: 12, fontFamily: FONT_B, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                        <span style={{ color: "#f87171" }}>{t.klubi_nisjes || "—"}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 8px" }}>→</span>
                        <span style={{ color: "#4ade80" }}>{t.klubi_destinacionit || "—"}</span>
                      </div>
                    </div>

                    {/* Data */}
                    <div style={{ flex: 1.5, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: FONT_B, fontWeight: 600 }}>
                      {fmtDate(t.data_transferimit)}
                    </div>

                    {/* Shuma */}
                    <div style={{ flex: 1.5 }}>
                      <span style={{ fontFamily: FONT_H, fontSize: 16, color: "#facc15" }}>{fmtShuma(t.shuma)}</span>
                    </div>

                    {/* Statusi */}
                    <div style={{ flex: 1.5 }}>
                      <span style={{ background: sc.bg, color: sc.fg, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>
                        {t.statusi}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2" style={{ flex: 1.5, justifyContent: "flex-end" }}>
                      <button onClick={() => setModalTransfer({ ...t })} className="btn d-flex align-items-center gap-1"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, padding: "6px 12px" }}>
                        <i className="bi bi-pencil" style={{ fontSize: 11 }} />EDITO
                      </button>
                      <button onClick={() => setDeleteTarget(t)} className="btn d-flex align-items-center gap-1"
                        style={{ background: "rgba(255,77,77,0.1)", color: "#ff4d4d", border: "1px solid rgba(255,77,77,0.2)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, padding: "6px 12px" }}>
                        <i className="bi bi-trash3" style={{ fontSize: 11 }} />FSHI
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Count */}
            {!loading && (
              <div className="mt-3 d-flex justify-content-between align-items-center">
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: FONT_B, fontWeight: 600, letterSpacing: 1 }}>
                  {filtered.length !== transfers.length ? `${filtered.length} nga ${transfers.length} transferime` : `${transfers.length} transferime`}
                </span>
                {(search || filterLloji !== "Të gjitha" || filterSta !== "Të gjitha") && (
                  <button onClick={() => { setSearch(""); setFilterLloji("Të gjitha"); setFilterSta("Të gjitha"); }}
                    className="btn border-0 bg-transparent"
                    style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1 }}>
                    <i className="bi bi-x me-1" />PASTRO FILTRAT
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MODALS */}
          {modalTransfer !== null && (
            <TransferModal
              transfer={modalTransfer.id ? modalTransfer : null}
              players={players}
              onSave={modalTransfer.id ? handleUpdate : handleCreate}
              onClose={() => setModalTransfer(null)}
              saving={saving}
            />
          )}

          {deleteTarget && (
            <DeleteModal transfer={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} deleting={deleting} />
          )}

          {toast && (
            <div className="position-fixed d-flex align-items-center gap-3"
              style={{ bottom: 24, right: 24, background: DARK, border: "1px solid rgba(255,255,255,0.12)", borderLeft: `4px solid ${toast.type === "error" ? "#ff4d4d" : "#4ade80"}`, padding: "14px 18px", zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 260 }}>
              <i className={`bi ${toast.type === "error" ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`}
                style={{ color: toast.type === "error" ? "#ff4d4d" : "#4ade80", fontSize: 18 }} />
              <span style={{ color: "#fff", fontSize: 13, fontFamily: FONT_B, fontWeight: 600 }}>{toast.msg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
