import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axiosInstance";
import SideBar from "../../Components/SideBar";
import TopBar from "../../Components/TopBar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Dashboard.css";

const API         = "/api/contracts";
const PLAYERS_API = "/api/players";

const RED    = "#cc0000";
const DARK   = "#1a0000";
const FONT_H = "'Bebas Neue', sans-serif";
const FONT_B = "'Barlow', sans-serif";

const LLOJET   = ["Permanent", "I huazuar", "Akademi"];
const STATUSET = ["Aktiv", "Skaduar", "Anuluar"];

const STA_COLOR = {
  Aktiv:    { bg: "rgba(74,222,128,0.15)",  fg: "#4ade80"  },
  Skaduar:  { bg: "rgba(248,113,113,0.15)", fg: "#f87171"  },
  Anuluar:  { bg: "rgba(255,255,255,0.08)", fg: "rgba(255,255,255,0.4)" },
};

const LLOJI_COLOR = {
  Permanent:   { bg: "rgba(96,165,250,0.15)",  fg: "#60a5fa" },
  "I huazuar": { bg: "rgba(250,204,21,0.15)",  fg: "#facc15" },
  Akademi:     { bg: "rgba(167,139,250,0.15)", fg: "#a78bfa" },
};

if (!document.getElementById("mu-kontratat-fonts")) {
  const l = document.createElement("link");
  l.id   = "mu-kontratat-fonts";
  l.rel  = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap";
  document.head.appendChild(l);
}

function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
}


function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtWage(v) {
  const n = parseFloat(v);
  if (!n) return "—";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M/j`;
  if (n >= 1_000)     return `€${(n / 1_000).toFixed(0)}K/j`;
  return `€${n}/j`;
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
   CONTRACT MODAL
═══════════════════════════════════════════════════════════════════ */
const EMPTY = {
  player_id: "", data_fillimit: "", data_perfundimit: "",
  paga: "", bonus: "", lloji: "Permanent", statusi: "Aktiv", kushtet: "",
};

function ContractModal({ contract, players, onSave, onClose, saving }) {
  const isEdit = !!contract?.id;
  const [form, setForm] = useState(contract ? {
    ...contract,
    data_fillimit:    contract.data_fillimit?.split("T")[0]    || "",
    data_perfundimit: contract.data_perfundimit?.split("T")[0] || "",
  } : { ...EMPTY });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.player_id)         e.player_id        = "Zgjedh lojtarin";
    if (!form.data_fillimit)     e.data_fillimit     = "Data e fillimit kërkohet";
    if (!form.data_perfundimit)  e.data_perfundimit  = "Data e mbarimit kërkohet";
    if (form.data_fillimit && form.data_perfundimit && form.data_fillimit >= form.data_perfundimit)
      e.data_perfundimit = "Data mbarimit duhet të jetë pas fillimit";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      paga:  form.paga  ? +form.paga  : null,
      bonus: form.bonus ? +form.bonus : null,
    });
  };

  const days = daysLeft(form.data_perfundimit);

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
            <i className={`bi ${isEdit ? "bi-pencil-square" : "bi-file-earmark-plus"}`} style={{ color: "#fff", fontSize: 18 }} />
            <span style={{ fontFamily: FONT_H, fontSize: 22, letterSpacing: 2, color: "#fff" }}>
              {isEdit ? "EDITO KONTRATËN" : "SHTO KONTRATË TË RE"}
            </span>
          </div>
          <button onClick={onClose} className="btn border-0 bg-transparent text-white"><i className="bi bi-x-lg" /></button>
        </div>

        <div className="overflow-auto px-4 py-4" style={{ flex: 1 }}>

          {/* Player */}
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
              <label style={LABEL}>Lloji i Kontratës</label>
              <select className="form-select" style={INPUT(false)} value={form.lloji} onChange={e => set("lloji", e.target.value)}>
                {LLOJET.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label style={LABEL}>Statusi</label>
              <select className="form-select" style={INPUT(false)} value={form.statusi} onChange={e => set("statusi", e.target.value)}>
                {STATUSET.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Datat */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Data e Fillimit *</label>
              <input type="date" className="form-control" style={INPUT(errors.data_fillimit)}
                value={form.data_fillimit} onChange={e => set("data_fillimit", e.target.value)} />
              {errors.data_fillimit && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.data_fillimit}</small>}
            </div>
            <div className="col-6">
              <label style={LABEL}>
                Data e Mbarimit *
                {days !== null && form.data_perfundimit && (
                  <span style={{ color: days < 0 ? "#f87171" : days < 180 ? "#facc15" : "#4ade80", marginLeft: 6 }}>
                    · {days < 0 ? `skadoi ${Math.abs(days)}d` : `${days}d mbetur`}
                  </span>
                )}
              </label>
              <input type="date" className="form-control" style={INPUT(errors.data_perfundimit)}
                value={form.data_perfundimit} onChange={e => set("data_perfundimit", e.target.value)} />
              {errors.data_perfundimit && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.data_perfundimit}</small>}
            </div>
          </div>

          {/* Paga + Bonus */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Paga Javore (€)</label>
              <input type="number" step="1000" className="form-control" style={INPUT(false)}
                value={form.paga || ""} onChange={e => set("paga", e.target.value)} placeholder="p.sh. 350000" />
              {form.paga > 0 && (
                <small style={{ color: "#facc15", fontSize: 11 }}>{fmtWage(form.paga)}</small>
              )}
            </div>
            <div className="col-6">
              <label style={LABEL}>Bonus (€)</label>
              <input type="number" step="10000" className="form-control" style={INPUT(false)}
                value={form.bonus || ""} onChange={e => set("bonus", e.target.value)} placeholder="p.sh. 1000000" />
            </div>
          </div>

          {/* Kushtet */}
          <div className="mb-1">
            <label style={LABEL}>Kushtet / Shënime</label>
            <textarea className="form-control" style={{ ...INPUT(false), resize: "none" }} rows={3}
              value={form.kushtet || ""} onChange={e => set("kushtet", e.target.value)}
              placeholder="Klauzola, opsione rinovimi, kushte të veçanta..." />
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
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />DUKE RUAJTUR...</> : isEdit ? "PËRDITËSO" : "SHTO KONTRATËN"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DELETE MODAL
═══════════════════════════════════════════════════════════════════ */
function DeleteModal({ contract, onConfirm, onClose, deleting }) {
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
          <h5 style={{ fontFamily: FONT_H, fontSize: 24, color: "#fff", letterSpacing: 1 }}>FSHI KONTRATËN?</h5>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: FONT_B, marginBottom: 24 }}>
            Je i sigurt për kontratën e <strong style={{ color: "#fff" }}>{contract.emri_lojtarit}</strong>? Ky veprim nuk mund të kthehet.
          </p>
          <div className="d-flex gap-2">
            <button onClick={onClose} className="btn flex-fill"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontFamily: FONT_B, fontWeight: 700, fontSize: 13, borderRadius: 0, padding: "12px 0" }}>
              ANULO
            </button>
            <button onClick={() => onConfirm(contract.id)} disabled={deleting} className="btn flex-fill fw-bold"
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
export default function DashboardKontratat() {
  const [contracts, setContracts] = useState([]);
  const [players,   setPlayers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterSta, setFilterSta] = useState("Të gjitha");
  const [filterLloji, setFilterLloji] = useState("Të gjitha");

  const [modalContract, setModalContract] = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchContracts = () => {
    setLoading(true);
    api.get(API)
      .then(r => setContracts(r.data))
      .catch(() => showToast("Gabim gjatë marrjes së kontratave", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContracts();
    api.get(PLAYERS_API).then(r => setPlayers(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await api.post(API, data);
      showToast("Kontrata u shtua!"); setModalContract(null); fetchContracts();
    } catch (err) { showToast(err.response?.data?.error || "Gabim gjatë shtimit", "error"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await api.put(`${API}/${data.id}`, data);
      showToast("Kontrata u përditësua!"); setModalContract(null); fetchContracts();
    } catch (err) { showToast(err.response?.data?.error || "Gabim gjatë përditësimit", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`${API}/${id}`);
      showToast("Kontrata u fshi!"); setDeleteTarget(null); fetchContracts();
    } catch { showToast("Gabim gjatë fshirjes", "error"); }
    finally { setDeleting(false); }
  };

  /* ── filter + search ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contracts.filter(c => {
      const matchSta   = filterSta   === "Të gjitha" || c.statusi === filterSta;
      const matchLloji = filterLloji === "Të gjitha" || c.lloji   === filterLloji;
      const matchQ     = !q || (c.emri_lojtarit || "").toLowerCase().includes(q);
      return matchSta && matchLloji && matchQ;
    });
  }, [contracts, search, filterSta, filterLloji]);

  /* ── summary stats ── */
  const aktive    = contracts.filter(c => c.statusi === "Aktiv").length;
  const expiring  = contracts.filter(c => { const d = daysLeft(c.data_perfundimit); return d !== null && d >= 0 && d <= 180 && c.statusi === "Aktiv"; }).length;
  const skaduar   = contracts.filter(c => c.statusi === "Skaduar").length;
  const totalWage = contracts.filter(c => c.statusi === "Aktiv").reduce((s, c) => s + (+c.paga || 0), 0);

  const statCards = [
    { icon: "bi-file-earmark-check", label: "AKTIVE",         value: aktive,          color: "#4ade80" },
    { icon: "bi-clock-history",      label: "PO SKADOJNË",    value: expiring,        color: "#facc15" },
    { icon: "bi-file-earmark-x",     label: "SKADUAR",        value: skaduar,         color: "#f87171" },
    { icon: "bi-currency-euro",      label: "PAGË TOTALE/J",  value: fmtWage(totalWage).replace("/j",""), color: "#60a5fa" },
  ];

  return (
    <div className="shell">
      <SideBar active="/contracts" />
      <div className="main">
        <TopBar title="Menaxhimi i Kontratave">
          <button onClick={() => setModalContract({})} className="btn btn-sm"
            style={{ background: RED, color: "#fff", border: "none", fontWeight: 600 }}>
            + Shto Kontratë
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
              {/* Search */}
              <div className="d-flex align-items-center gap-2" style={{ flex: "1 1 200px" }}>
                <i className="bi bi-search" style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }} />
                <input className="form-control border-0"
                  style={{ background: "transparent", color: "#fff", fontFamily: FONT_B, fontSize: 14, boxShadow: "none" }}
                  placeholder="Kërko lojtarin..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && (
                  <button onClick={() => setSearch("")} className="btn border-0 bg-transparent p-0"
                    style={{ color: "rgba(255,255,255,0.3)" }}><i className="bi bi-x" /></button>
                )}
              </div>
              {/* Status filter */}
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
              {/* Lloji filter */}
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
            </div>

            {/* TABLE */}
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>

              {/* Header */}
              <div className="d-none d-md-flex align-items-center px-3 py-2"
                style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[["LOJTARI",3],["LLOJI",2],["FILLIM — MBARIM",2.5],["PAGË/JAVË",1.5],["STATUSI / KOHËZGJATJA",2.5],["",1.5]].map(([lbl, flex]) => (
                  <div key={lbl} style={{ flex, fontFamily: FONT_B, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                    {lbl}
                  </div>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center py-5">
                  <span className="spinner-border" style={{ color: RED }} />
                </div>
              )}

              {/* Empty */}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-x" style={{ fontSize: 48, color: "rgba(255,255,255,0.1)" }} />
                  <p className="mt-3 mb-0" style={{ fontFamily: FONT_H, fontSize: 20, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>
                    ASNJË KONTRATË
                  </p>
                  {!search && filterSta === "Të gjitha" && filterLloji === "Të gjitha" && (
                    <button onClick={() => setModalContract({})} className="btn mt-3"
                      style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", fontFamily: FONT_B, fontWeight: 700, fontSize: 12, letterSpacing: 1, borderRadius: 0, padding: "10px 24px" }}>
                      + SHTO KONTRATËN E PARË
                    </button>
                  )}
                </div>
              )}

              {/* Rows */}
              {!loading && filtered.map(c => {
                const days     = daysLeft(c.data_perfundimit);
                const sc       = STA_COLOR[c.statusi]   || STA_COLOR["Anuluar"];
                const lc       = LLOJI_COLOR[c.lloji]   || LLOJI_COLOR["Permanent"];
                const expWarn  = days !== null && days >= 0 && days <= 180 && c.statusi === "Aktiv";
                const expired  = days !== null && days < 0;

                return (
                  <div key={c.id} className="d-flex flex-wrap flex-md-nowrap align-items-center px-3 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", borderLeft: expWarn ? "3px solid #facc15" : expired ? "3px solid #f87171" : "3px solid transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                    {/* Lojtari */}
                    <div className="d-flex align-items-center gap-3" style={{ flex: 3, minWidth: 0 }}>
                      <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 40, height: 40, background: RED, borderRadius: 4 }}>
                        <span style={{ fontFamily: FONT_H, fontSize: 16, color: "#fff" }}>{c.numri_faneles ?? "—"}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: FONT_H, fontSize: 16, color: "#fff", letterSpacing: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.emri_lojtarit}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: FONT_B }}>
                          {c.pozicioni}
                        </div>
                      </div>
                    </div>

                    {/* Lloji */}
                    <div style={{ flex: 2 }}>
                      <span style={{ background: lc.bg, color: lc.fg, border: `1px solid ${lc.fg}44`, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>
                        {c.lloji}
                      </span>
                    </div>

                    {/* Datat */}
                    <div style={{ flex: 2.5 }}>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: FONT_B, fontWeight: 600 }}>
                        {fmtDate(c.data_fillimit)}
                      </div>
                      <div style={{ fontSize: 12, color: expired ? "#f87171" : expWarn ? "#facc15" : "rgba(255,255,255,0.4)", fontFamily: FONT_B, fontWeight: 600 }}>
                        → {fmtDate(c.data_perfundimit)}
                      </div>
                    </div>

                    {/* Paga */}
                    <div style={{ flex: 1.5 }}>
                      <span style={{ fontFamily: FONT_H, fontSize: 15, color: "#facc15" }}>{fmtWage(c.paga)}</span>
                    </div>

                    {/* Statusi + ditët */}
                    <div style={{ flex: 2.5 }}>
                      <span style={{ background: sc.bg, color: sc.fg, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>
                        {c.statusi}
                      </span>
                      {days !== null && (
                        <div style={{ fontSize: 10, color: expired ? "#f87171" : expWarn ? "#facc15" : "rgba(255,255,255,0.25)", fontFamily: FONT_B, fontWeight: 600, marginTop: 3 }}>
                          {expired ? `Skadoi ${Math.abs(days)} ditë më parë` : expWarn ? `⚠ ${days} ditë mbetur` : `${days} ditë mbetur`}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2" style={{ flex: 1.5, justifyContent: "flex-end" }}>
                      <button onClick={() => setModalContract({ ...c })} className="btn d-flex align-items-center gap-1"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, padding: "6px 12px" }}>
                        <i className="bi bi-pencil" style={{ fontSize: 11 }} />EDITO
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="btn d-flex align-items-center gap-1"
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
                  {filtered.length !== contracts.length ? `${filtered.length} nga ${contracts.length} kontrata` : `${contracts.length} kontrata`}
                </span>
                {(search || filterSta !== "Të gjitha" || filterLloji !== "Të gjitha") && (
                  <button onClick={() => { setSearch(""); setFilterSta("Të gjitha"); setFilterLloji("Të gjitha"); }}
                    className="btn border-0 bg-transparent"
                    style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1 }}>
                    <i className="bi bi-x me-1" />PASTRO FILTRAT
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MODALS */}
          {modalContract !== null && (
            <ContractModal
              contract={modalContract.id ? modalContract : null}
              players={players}
              onSave={modalContract.id ? handleUpdate : handleCreate}
              onClose={() => setModalContract(null)}
              saving={saving}
            />
          )}

          {deleteTarget && (
            <DeleteModal contract={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} deleting={deleting} />
          )}

          {/* TOAST */}
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
