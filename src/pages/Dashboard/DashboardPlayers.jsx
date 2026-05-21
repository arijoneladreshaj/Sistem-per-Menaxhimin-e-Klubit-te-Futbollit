import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Dashboard.css";

const API = "http://localhost:5001/players";

const RED    = "#cc0000";
const DARK   = "#1a0000";
const FONT_H = "'Bebas Neue', sans-serif";
const FONT_B = "'Barlow', sans-serif";

const POZICIONET = ["Portier", "Mbrojtës", "Mesfushor", "Sulmues"];
const STATUSET   = ["Aktiv", "Lenduar", "I transferuar", "I pensionuar"];

const POZ_COLOR = {
  Portier:   "#facc15",
  Mbrojtës:  "#60a5fa",
  Mesfushor: "#4ade80",
  Sulmues:   "#f87171",
};
const STA_COLOR = {
  Aktiv:          { bg: "rgba(74,222,128,0.15)",  fg: "#4ade80"  },
  Lenduar:        { bg: "rgba(248,113,113,0.15)", fg: "#f87171"  },
  "I transferuar":{ bg: "rgba(96,165,250,0.15)",  fg: "#60a5fa"  },
  "I pensionuar": { bg: "rgba(255,255,255,0.08)", fg: "rgba(255,255,255,0.45)" },
};

if (!document.getElementById("mu-dash-fonts")) {
  const l = document.createElement("link");
  l.id  = "mu-dash-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap";
  document.head.appendChild(l);
}

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function calcAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function fmtValue(v) {
  const n = parseFloat(v);
  if (!n) return "—";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n}`;
}

function exportCSV(rows) {
  const cols = ["Nr","Emri","Mbiemri","Mosha","Kombësia","Pozicioni","Pesha","Gjatësia","Statusi","Vlera (€)"];
  const lines = [cols.join(","), ...rows.map(p =>
    [p.numri_faneles, p.emri, p.mbiemri, calcAge(p.data_lindjes) ?? "",
     p.kombesia, p.pozicioni, p.pesha ?? "", p.gjatesia ?? "",
     p.statusi, p.vlera_tregut ?? ""].join(",")
  )];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lojtaret.csv";
  a.click();
}

/* ─── shared styles ─────────────────────────────────────────────────────────── */
const INPUT = (err) => ({
  background: "rgba(255,255,255,0.06)",
  border: err ? "1.5px solid #ff4d4d" : "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontFamily: FONT_B, fontSize: 14, borderRadius: 0, padding: "10px 14px",
});
const LABEL = {
  fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1.5,
  color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 6,
};

/* ═══════════════════════════════════════════════════════════════════════════════
   SKELETON ROW
═══════════════════════════════════════════════════════════════════════════════ */
function SkeletonRow() {
  return (
    <div className="d-flex align-items-center px-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {[3, 2, 2, 1.5, 1.5, 1.5].map((flex, i) => (
        <div key={i} style={{ flex, paddingRight: 12 }}>
          <div style={{
            height: i === 0 ? 20 : 14,
            borderRadius: 3,
            background: "rgba(255,255,255,0.06)",
            animation: "pulse 1.5s ease-in-out infinite",
            width: i === 0 ? "70%" : "50%",
          }} />
          {i === 0 && <div style={{ height: 10, borderRadius: 3, background: "rgba(255,255,255,0.04)", marginTop: 6, width: "40%", animation: "pulse 1.5s ease-in-out infinite" }} />}
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════════════════════════════════════════ */
function DetailModal({ player, onEdit, onClose }) {
  const age   = calcAge(player.data_lindjes);
  const color = POZ_COLOR[player.pozicioni] || "#fff";
  const sc    = STA_COLOR[player.statusi]   || STA_COLOR["I pensionuar"];

  const row = (icon, label, val) => val ? (
    <div className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <i className={`bi ${icon}`} style={{ color: "rgba(255,255,255,0.3)", fontSize: 15, width: 18 }} />
      <span style={{ fontFamily: FONT_B, fontSize: 12, color: "rgba(255,255,255,0.4)", width: 110 }}>{label}</span>
      <span style={{ fontFamily: FONT_B, fontSize: 13, color: "#fff", fontWeight: 600 }}>{val}</span>
    </div>
  ) : null;

  return (
    <>
      <div onClick={onClose} className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1000 }} />
      <div className="position-fixed d-flex flex-column" style={{
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 1001, width: "95%", maxWidth: 480, background: DARK,
        border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden",
      }}>
        {/* Banner */}
        <div style={{ background: `linear-gradient(135deg, ${color}22, transparent)`, borderBottom: `3px solid ${color}`, padding: "28px 24px 20px" }}>
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
              width: 72, height: 72, background: RED, borderRadius: 8,
              border: `2px solid ${color}`,
            }}>
              <span style={{ fontFamily: FONT_H, fontSize: 30, color: "#fff" }}>{player.numri_faneles ?? "—"}</span>
            </div>
            <div>
              <div style={{ fontFamily: FONT_H, fontSize: 28, color: "#fff", letterSpacing: 1, lineHeight: 1 }}>
                {player.emri} {player.mbiemri}
              </div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>
                  {player.pozicioni}
                </span>
                <span style={{ background: sc.bg, color: sc.fg, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>
                  {player.statusi}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3" style={{ flex: 1, overflowY: "auto" }}>
          {row("bi-globe2",         "Kombësia",     player.kombesia)}
          {row("bi-calendar3",      "Data lindjes", player.data_lindjes ? `${new Date(player.data_lindjes).toLocaleDateString("sq-AL")}${age ? ` · ${age} vjeç` : ""}` : null)}
          {row("bi-rulers",         "Gjatësia",     player.gjatesia ? `${player.gjatesia} cm` : null)}
          {row("bi-activity",       "Pesha",        player.pesha ? `${player.pesha} kg` : null)}
          {row("bi-currency-euro",  "Vlera tregut", fmtValue(player.vlera_tregut))}
          {row("bi-building",       "Klubi",        player.club_name)}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 d-flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.45)" }}>
          <button onClick={onClose} className="btn flex-fill" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontFamily: FONT_B, fontWeight: 700, fontSize: 13, letterSpacing: 1, borderRadius: 0, padding: "11px 0" }}>
            MBYLL
          </button>
          <button onClick={onEdit} className="btn flex-fill" style={{ background: "#fff", color: RED, fontFamily: FONT_H, fontSize: 16, letterSpacing: 2, border: "none", borderRadius: 0, padding: "11px 0" }}>
            <i className="bi bi-pencil me-2" style={{ fontSize: 13 }} />EDITO
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FORM MODAL
═══════════════════════════════════════════════════════════════════════════════ */
const EMPTY = { club_id: 1, emri: "", mbiemri: "", data_lindjes: "", kombesia: "", pozicioni: "Sulmues", numri_faneles: "", pesha: "", gjatesia: "", statusi: "Aktiv", vlera_tregut: "" };

function PlayerModal({ player, onSave, onClose, saving }) {
  const isEdit = !!player?.id;
  const [form, setForm]     = useState(player ? { ...player } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(player?.foto_url || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef();
  const age = calcAge(form.data_lindjes);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.emri.trim())    e.emri    = "Emri është i detyrueshëm";
    if (!form.mbiemri.trim()) e.mbiemri = "Mbiemri është i detyrueshëm";
    if (!form.pozicioni)      e.pozicioni = "Zgjedh pozicionin";
    if (form.numri_faneles && (isNaN(form.numri_faneles) || +form.numri_faneles < 1 || +form.numri_faneles > 99))
      e.numri_faneles = "Numri 1–99";
    if (form.pesha && (+form.pesha < 40 || +form.pesha > 150))
      e.pesha = "Pesha 40–150 kg";
    if (form.gjatesia && (+form.gjatesia < 140 || +form.gjatesia > 220))
      e.gjatesia = "Gjatësia 140–220 cm";
    if (form.vlera_tregut && +form.vlera_tregut < 0)
      e.vlera_tregut = "Vlera duhet të jetë pozitive";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      { ...form, numri_faneles: form.numri_faneles ? +form.numri_faneles : null, pesha: form.pesha ? +form.pesha : null, gjatesia: form.gjatesia ? +form.gjatesia : null, vlera_tregut: form.vlera_tregut ? +form.vlera_tregut : null },
      photoFile
    );
  };

  return (
    <>
    
      <div onClick={onClose} className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1000 }} />
      <div className="position-fixed d-flex flex-column" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1001, width: "95%", maxWidth: 600, maxHeight: "92vh", background: DARK, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden" }}>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ background: "rgba(0,0,0,0.45)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${isEdit ? "bi-pencil-square" : "bi-person-plus"}`} style={{ color: "#fff", fontSize: 18 }} />
            <span style={{ fontFamily: FONT_H, fontSize: 22, letterSpacing: 2, color: "#fff" }}>
              {isEdit ? "EDITO LOJTARIN" : "SHTO LOJTAR TË RI"}
            </span>
          </div>
          <button onClick={onClose} className="btn border-0 bg-transparent text-white"><i className="bi bi-x-lg" /></button>
        </div>

        {/* Body */}
        <div className="overflow-auto px-4 py-4" style={{ flex: 1 }}>

          {/* Emri + Mbiemri */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Emri *</label>
              <input className="form-control" style={INPUT(errors.emri)} value={form.emri} onChange={e => set("emri", e.target.value)} placeholder="p.sh. Liridon" />
              {errors.emri && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.emri}</small>}
            </div>
            <div className="col-6">
              <label style={LABEL}>Mbiemri *</label>
              <input className="form-control" style={INPUT(errors.mbiemri)} value={form.mbiemri} onChange={e => set("mbiemri", e.target.value)} placeholder="p.sh. Krasniqi" />
              {errors.mbiemri && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.mbiemri}</small>}
            </div>
          </div>

          {/* Data lindjes + Kombesia */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Data e Lindjes {age ? <span style={{ color: "#4ade80", fontWeight: 700 }}>· {age} vjeç</span> : ""}</label>
              <input type="date" className="form-control" style={INPUT(false)} value={form.data_lindjes || ""} onChange={e => set("data_lindjes", e.target.value)} />
            </div>
            <div className="col-6">
              <label style={LABEL}>Kombësia</label>
              <input className="form-control" style={INPUT(false)} value={form.kombesia} onChange={e => set("kombesia", e.target.value)} placeholder="p.sh. Kosovar" />
            </div>
          </div>

          {/* Pozicioni + Numri */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Pozicioni *</label>
              <select className="form-select" style={INPUT(errors.pozicioni)} value={form.pozicioni} onChange={e => set("pozicioni", e.target.value)}>
                {POZICIONET.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.pozicioni && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.pozicioni}</small>}
            </div>
            <div className="col-6">
              <label style={LABEL}>Nr. Fanellës (1–99)</label>
              <input type="number" min={1} max={99} className="form-control" style={INPUT(errors.numri_faneles)} value={form.numri_faneles} onChange={e => set("numri_faneles", e.target.value)} placeholder="10" />
              {errors.numri_faneles && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.numri_faneles}</small>}
            </div>
          </div>

          {/* Pesha + Gjatesia */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label style={LABEL}>Pesha (kg)</label>
              <input type="number" step="0.1" className="form-control" style={INPUT(errors.pesha)} value={form.pesha || ""} onChange={e => set("pesha", e.target.value)} placeholder="75.5" />
              {errors.pesha && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.pesha}</small>}
            </div>
            <div className="col-6">
              <label style={LABEL}>Gjatësia (cm)</label>
              <input type="number" step="0.1" className="form-control" style={INPUT(errors.gjatesia)} value={form.gjatesia || ""} onChange={e => set("gjatesia", e.target.value)} placeholder="181" />
              {errors.gjatesia && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.gjatesia}</small>}
            </div>
          </div>

          {/* Foto */}
          <div className="mb-3">
            <label style={LABEL}>Foto e Lojtarit</label>
            <div className="d-flex align-items-center gap-3">
              <div onClick={() => fileInputRef.current.click()} style={{
                width: 80, height: 80, borderRadius: 6, overflow: "hidden", flexShrink: 0, cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "2px dashed rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
              }}>
                {photoPreview
                  ? <img src={photoPreview} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="bi bi-camera" style={{ fontSize: 24, color: "rgba(255,255,255,0.3)" }} />}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <i className="bi bi-pencil" style={{ color: "#fff", fontSize: 16 }} />
                </div>
              </div>
              <div>
                <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-sm d-block mb-1"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0 }}>
                  <i className="bi bi-upload me-1" />{photoPreview ? "NDRYSHO FOTON" : "NGARKO FOTON"}
                </button>
                {uploadingPhoto && <small style={{ color: "#60a5fa", fontSize: 11 }}>Duke ngarkuar...</small>}
                {photoPreview && !uploadingPhoto && <small style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>PNG, JPG, WebP · max 5MB</small>}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </div>

          {/* Statusi + Vlera */}
          <div className="row g-3 mb-1">
            <div className="col-6">
              <label style={LABEL}>Statusi</label>
              <select className="form-select" style={INPUT(false)} value={form.statusi} onChange={e => set("statusi", e.target.value)}>
                {STATUSET.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label style={LABEL}>Vlera e Tregut (€)</label>
              <input type="number" step="1000" className="form-control" style={INPUT(errors.vlera_tregut)} value={form.vlera_tregut || ""} onChange={e => set("vlera_tregut", e.target.value)} placeholder="5000000" />
              {errors.vlera_tregut && <small style={{ color: "#ff4d4d", fontSize: 11 }}>{errors.vlera_tregut}</small>}
              {form.vlera_tregut > 0 && <small style={{ color: "#facc15", fontSize: 11 }}>{fmtValue(form.vlera_tregut)}</small>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 d-flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.45)" }}>
          <button onClick={onClose} className="btn flex-fill" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontFamily: FONT_B, fontWeight: 700, fontSize: 13, letterSpacing: 1, borderRadius: 0, padding: "12px 0" }}>ANULO</button>
          <button onClick={submit} disabled={saving} className="btn flex-fill fw-bold" style={{ background: "#fff", color: RED, fontFamily: FONT_H, fontSize: 16, letterSpacing: 2, border: "none", borderRadius: 0, padding: "12px 0", opacity: saving ? 0.6 : 1 }}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />DUKE RUAJTUR...</> : isEdit ? "PËRDITËSO" : "SHTO LOJTARIN"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DELETE MODAL
═══════════════════════════════════════════════════════════════════════════════ */
function DeleteModal({ player, onConfirm, onClose, deleting }) {
  return (
    <>
      <div onClick={onClose} className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1000 }} />
      <div className="position-fixed p-4" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1002, width: 400, background: DARK, border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="text-center">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 64, height: 64, background: "rgba(255,77,77,0.15)" }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: 28, color: "#ff4d4d" }} />
          </div>
          <h5 style={{ fontFamily: FONT_H, fontSize: 24, color: "#fff", letterSpacing: 1 }}>FSHI LOJTARIN?</h5>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: FONT_B, marginBottom: 24 }}>
            Je i sigurt për <strong style={{ color: "#fff" }}>{player.emri} {player.mbiemri}</strong>? Ky veprim nuk mund të kthehet.
          </p>
          <div className="d-flex gap-2">
            <button onClick={onClose} className="btn flex-fill" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", fontFamily: FONT_B, fontWeight: 700, fontSize: 13, borderRadius: 0, padding: "12px 0" }}>ANULO</button>
            <button onClick={() => onConfirm(player.id)} disabled={deleting} className="btn flex-fill fw-bold" style={{ background: "#ff4d4d", color: "#fff", fontFamily: FONT_H, fontSize: 16, letterSpacing: 2, border: "none", borderRadius: 0, padding: "12px 0", opacity: deleting ? 0.6 : 1 }}>
              {deleting ? <><span className="spinner-border spinner-border-sm me-2" />DUKE FSHIRË...</> : <><i className="bi bi-trash3 me-2" />FSHI</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SORT HEADER
═══════════════════════════════════════════════════════════════════════════════ */
function SortHeader({ label, field, sortField, sortDir, onSort, flex }) {
  const active = sortField === field;
  return (
    <div onClick={() => onSort(field)} style={{ flex, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontFamily: FONT_B, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: active ? "#fff" : "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{label}</span>
      <i className={`bi ${active ? (sortDir === "asc" ? "bi-caret-up-fill" : "bi-caret-down-fill") : "bi-chevron-expand"}`} style={{ fontSize: 9, color: active ? RED : "rgba(255,255,255,0.2)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════════ */
export default function DashboardPlayers() {
  const navigate = useNavigate();

  const [players,  setPlayers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filterPoz, setFilterPoz] = useState("Të gjithë");
  const [filterSta, setFilterSta] = useState("Të gjithë");
  const [sortField, setSortField] = useState("mbiemri");
  const [sortDir,   setSortDir]   = useState("asc");

  const [modalPlayer,  setModalPlayer]  = useState(null);
  const [detailPlayer, setDetailPlayer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  /* ── fetch ── */
  const fetchPlayers = () => {
    setLoading(true);
    api.get(API).then(r => setPlayers(r.data)).catch(() => showToast("Gabim gjatë marrjes së lojtarëve", "error")).finally(() => setLoading(false));
  };
  useEffect(() => { fetchPlayers(); }, []);

  /* ── CRUD ── */
  const uploadPhoto = async (id, file) => {
    const fd = new FormData();
    fd.append("foto", file);
    await api.post(`${API}/${id}/photo`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  };

  const handleCreate = async (data, photoFile) => {
    setSaving(true);
    try {
      const res = await api.post(API, data);
      if (photoFile) await uploadPhoto(res.data.id, photoFile);
      showToast("Lojtari u shtua!"); setModalPlayer(null); fetchPlayers();
    }
    catch (err) { showToast(err.response?.data?.error || "Gabim gjatë shtimit", "error"); }
    finally { setSaving(false); }
  };
  const handleUpdate = async (data, photoFile) => {
    setSaving(true);
    try {
      await api.put(`${API}/${data.id}`, data);
      if (photoFile) await uploadPhoto(data.id, photoFile);
      showToast("Lojtari u përditësua!"); setModalPlayer(null); fetchPlayers();
    }
    catch (err) { showToast(err.response?.data?.error || "Gabim gjatë përditësimit", "error"); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    setDeleting(true);
    try { await api.delete(`${API}/${id}`); showToast("Lojtari u fshi!"); setDeleteTarget(null); fetchPlayers(); }
    catch { showToast("Gabim gjatë fshirjes", "error"); }
    finally { setDeleting(false); }
  };

  /* ── sort handler ── */
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = players.filter(p => {
      const matchPoz = filterPoz === "Të gjithë" || p.pozicioni === filterPoz;
      const matchSta = filterSta === "Të gjithë" || p.statusi   === filterSta;
      const matchQ   = !q || `${p.emri} ${p.mbiemri}`.toLowerCase().includes(q) || String(p.numri_faneles ?? "").includes(q) || (p.kombesia ?? "").toLowerCase().includes(q);
      return matchPoz && matchSta && matchQ;
    });
    list = [...list].sort((a, b) => {
      let va = a[sortField] ?? "", vb = b[sortField] ?? "";
      if (sortField === "vlera_tregut" || sortField === "numri_faneles") { va = +va; vb = +vb; }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [players, search, filterPoz, filterSta, sortField, sortDir]);

  /* ── stats ── */
  const avgAge = useMemo(() => {
    const ages = players.map(p => calcAge(p.data_lindjes)).filter(Boolean);
    return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
  }, [players]);

  const totalValue = players.reduce((s, p) => s + (+p.vlera_tregut || 0), 0);

  const pozBreakdown = useMemo(() => POZICIONET.map(poz => ({
    poz, count: players.filter(p => p.pozicioni === poz).length,
    color: POZ_COLOR[poz],
  })), [players]);

  const statCards = [
    { icon: "bi-people",       label: "TOTALI",        value: players.length, color: "#fff" },
    { icon: "bi-heart-pulse",  label: "AKTIVË",        value: players.filter(p => p.statusi === "Aktiv").length, color: "#4ade80" },
    { icon: "bi-calendar3",    label: "MOSHA MESATARE",value: avgAge ? `${avgAge} vj` : "—", color: "#60a5fa" },
    { icon: "bi-currency-euro",label: "VLERA TOTALE",  value: fmtValue(totalValue), color: "#facc15" },
  ];

  return (
    <div className="shell">

      
<SideBar active="/DashboardPlayers" />

      
      <div className="main">

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">Menaxhimi i Lojtarëve</div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={() => exportCSV(filtered)} className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-download me-1" />Eksporto CSV
            </button>
            <button onClick={() => setModalPlayer({})} className="btn btn-sm" style={{ background: "#DA291C", color: "#fff", border: "none", fontWeight: 600 }}>
              + Shto Lojtar
            </button>
            <div className="avatar">AK</div>
          </div>
        </div>

        <div className="content" style={{ background: `linear-gradient(135deg, ${DARK} 0%, #2d0000 50%, ${DARK} 100%)`, fontFamily: FONT_B }}>

      <div className="px-4 py-4" style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── STAT CARDS ── */}
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

        {/* ── POZICION BREAKDOWN ── */}
        <div className="d-flex gap-3 mb-4 flex-wrap">
          {pozBreakdown.map(({ poz, count, color }) => (
            <div key={poz} className="d-flex align-items-center gap-2 px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, cursor: "pointer" }} onClick={() => setFilterPoz(filterPoz === poz ? "Të gjithë" : poz)}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontFamily: FONT_B, fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{poz}</span>
              <span style={{ fontFamily: FONT_H, fontSize: 18, color, letterSpacing: 1 }}>{count}</span>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4 p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Search */}
          <div className="d-flex align-items-center gap-2" style={{ flex: "1 1 200px" }}>
            <i className="bi bi-search" style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }} />
            <input className="form-control border-0" style={{ background: "transparent", color: "#fff", fontFamily: FONT_B, fontSize: 14, boxShadow: "none" }} placeholder="Kërko emër, nr, kombësi…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="btn border-0 bg-transparent p-0" style={{ color: "rgba(255,255,255,0.3)" }}><i className="bi bi-x" /></button>}
          </div>
          {/* Position filter */}
          <div className="d-flex gap-1 flex-wrap">
            {["Të gjithë", ...POZICIONET].map(poz => (
              <button key={poz} onClick={() => setFilterPoz(poz)} className="btn" style={{ background: filterPoz === poz ? "#fff" : "rgba(255,255,255,0.06)", color: filterPoz === poz ? RED : "rgba(255,255,255,0.5)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, border: filterPoz === poz ? "1px solid #fff" : "1px solid rgba(255,255,255,0.1)", padding: "5px 14px" }}>
                {poz}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <div className="d-flex gap-1 flex-wrap">
            {["Të gjithë", ...STATUSET].map(sta => {
              const sc = STA_COLOR[sta];
              const active = filterSta === sta;
              return (
                <button key={sta} onClick={() => setFilterSta(sta)} className="btn" style={{ background: active && sc ? sc.bg : "rgba(255,255,255,0.04)", color: active && sc ? sc.fg : "rgba(255,255,255,0.4)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, border: active && sc ? `1px solid ${sc.fg}44` : "1px solid rgba(255,255,255,0.08)", padding: "5px 14px" }}>
                  {sta}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>

          {/* Header row */}
          <div className="d-none d-md-flex align-items-center px-3 py-2" style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <SortHeader label="LOJTARI"   field="mbiemri"       sortField={sortField} sortDir={sortDir} onSort={handleSort} flex={3}   />
            <SortHeader label="POZICIONI" field="pozicioni"     sortField={sortField} sortDir={sortDir} onSort={handleSort} flex={2}   />
            <SortHeader label="KOMBËSIA"  field="kombesia"      sortField={sortField} sortDir={sortDir} onSort={handleSort} flex={2}   />
            <SortHeader label="STATUSI"   field="statusi"       sortField={sortField} sortDir={sortDir} onSort={handleSort} flex={1.5} />
            <SortHeader label="VLERA"     field="vlera_tregut"  sortField={sortField} sortDir={sortDir} onSort={handleSort} flex={1.5} />
            <div style={{ flex: 1.5 }} />
          </div>

          {/* Skeleton */}
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-person-x" style={{ fontSize: 48, color: "rgba(255,255,255,0.1)" }} />
              <p className="mt-3 mb-0" style={{ fontFamily: FONT_H, fontSize: 20, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>
                {search || filterPoz !== "Të gjithë" || filterSta !== "Të gjithë" ? "ASNJË REZULTAT" : "ASNJË LOJTAR"}
              </p>
              {!search && filterPoz === "Të gjithë" && filterSta === "Të gjithë" && (
                <button onClick={() => setModalPlayer({})} className="btn mt-3" style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", fontFamily: FONT_B, fontWeight: 700, fontSize: 12, letterSpacing: 1, borderRadius: 0, padding: "10px 24px" }}>+ SHTO LOJTARIN E PARË</button>
              )}
            </div>
          )}

          {/* Rows */}
          {!loading && filtered.map(p => {
            const age = calcAge(p.data_lindjes);
            const sc  = STA_COLOR[p.statusi] || STA_COLOR["I pensionuar"];
            const pc  = POZ_COLOR[p.pozicioni] || "rgba(255,255,255,0.4)";
            return (
              <div key={p.id} className="d-flex flex-wrap flex-md-nowrap align-items-center px-3 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => setDetailPlayer(p)}
              >
                {/* Lojtari */}
                <div className="d-flex align-items-center gap-3" style={{ flex: 3, minWidth: 0 }}>
                  <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: RED, borderRadius: 4, border: `2px solid ${pc}44` }}>
                    <span style={{ fontFamily: FONT_H, fontSize: 17, color: "#fff" }}>{p.numri_faneles ?? "—"}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: FONT_H, fontSize: 17, color: "#fff", letterSpacing: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.emri} {p.mbiemri}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: FONT_B }}>
                      {age ? `${age} vjeç` : ""}{age && p.gjatesia ? " · " : ""}{p.gjatesia ? `${p.gjatesia} cm` : ""}
                    </div>
                  </div>
                </div>

                {/* Pozicioni */}
                <div style={{ flex: 2 }}>
                  <span style={{ background: `${pc}22`, color: pc, border: `1px solid ${pc}44`, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>{p.pozicioni}</span>
                </div>

                {/* Kombesia */}
                <div style={{ flex: 2, fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: FONT_B, fontWeight: 600 }}>{p.kombesia || "—"}</div>

                {/* Statusi */}
                <div style={{ flex: 1.5 }}>
                  <span style={{ background: sc.bg, color: sc.fg, fontSize: 10, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1, padding: "2px 10px" }}>{p.statusi}</span>
                </div>

                {/* Vlera */}
                <div style={{ flex: 1.5 }}>
                  <span style={{ fontFamily: FONT_H, fontSize: 16, color: "#facc15" }}>{fmtValue(p.vlera_tregut)}</span>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2" style={{ flex: 1.5, justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setModalPlayer({ ...p })} className="btn d-flex align-items-center gap-1" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, padding: "6px 12px" }}>
                    <i className="bi bi-pencil" style={{ fontSize: 11 }} />EDITO
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="btn d-flex align-items-center gap-1" style={{ background: "rgba(255,77,77,0.1)", color: "#ff4d4d", border: "1px solid rgba(255,77,77,0.2)", fontFamily: FONT_B, fontWeight: 700, fontSize: 11, letterSpacing: 1, borderRadius: 0, padding: "6px 12px" }}>
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
              {filtered.length !== players.length ? `${filtered.length} nga ${players.length} lojtarë` : `${players.length} lojtarë`}
            </span>
            {(search || filterPoz !== "Të gjithë" || filterSta !== "Të gjithë") && (
              <button onClick={() => { setSearch(""); setFilterPoz("Të gjithë"); setFilterSta("Të gjithë"); }} className="btn border-0 bg-transparent" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT_B, fontWeight: 700, letterSpacing: 1 }}>
                <i className="bi bi-x me-1" />PASTRO FILTRAT
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {detailPlayer && !modalPlayer && (
        <DetailModal
          player={detailPlayer}
          onEdit={() => { setModalPlayer({ ...detailPlayer }); setDetailPlayer(null); }}
          onClose={() => setDetailPlayer(null)}
        />
      )}

      {modalPlayer !== null && (
        <PlayerModal
          player={modalPlayer.id ? modalPlayer : null}
          onSave={modalPlayer.id ? handleUpdate : handleCreate}
          onClose={() => setModalPlayer(null)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteModal player={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="position-fixed d-flex align-items-center gap-3" style={{ bottom: 24, right: 24, background: DARK, border: "1px solid rgba(255,255,255,0.12)", borderLeft: `4px solid ${toast.type === "error" ? "#ff4d4d" : "#4ade80"}`, padding: "14px 18px", zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 260 }}>
          <i className={`bi ${toast.type === "error" ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`} style={{ color: toast.type === "error" ? "#ff4d4d" : "#4ade80", fontSize: 18 }} />
          <span style={{ color: "#fff", fontSize: 13, fontFamily: FONT_B, fontWeight: 600 }}>{toast.msg}</span>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}
