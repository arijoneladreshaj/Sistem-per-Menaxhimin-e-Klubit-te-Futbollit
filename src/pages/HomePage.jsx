import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManchesterUnitedHome.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Navbar from "../Components/NavBar";
import api from "../api/axiosInstance";

const LAJME_API = "/api/lajme";
const KATEGORITE = ["TRANSFERIME", "NDESHJE", "LËNDIME", "KLUBI", "AKADEMIA"];

const MU_CREST = "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg";

function slugPhoto(first, last) {
  const norm = s => (s||"").toLowerCase()
    .replace(/[áàäâ]/g,"a").replace(/[éèëê]/g,"e").replace(/[íìïî]/g,"i")
    .replace(/[óòöô]/g,"o").replace(/[úùüû]/g,"u").replace(/ñ/g,"n").replace(/ç/g,"c")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
  const f = (first||"").trim(), l = (last||"").trim();
  return !f || f===l ? `/players/${norm(l)}.png` : `/players/${norm(f)}-${norm(l)}.png`;
}

const CONTENT_DEFAULTS = {
  hero_eyebrow:      "Sezoni 2025/26",
  hero_image:        "/homepage.jpg",
  hero_title_1:      "One Team.",
  hero_title_2:      "One Dream.",
  hero_description:  "Platforma zyrtare e Manchester United FC. Ndiqni ndeshjet, lojtarët dhe lajmet më të fundit.",
  hero_btn:          "SHIKO NDESHJET",
  about_eyebrow:     "ABOUT FC",
  about_title_1:     "Manchester United FC",
  about_title_2:     "Tradita e Fitores",
  about_description: "Themeluar më 1878, Manchester United është një nga klubet me historinë më të pasur në futbollin botëror. Me 20 tituj kampionë, 3 Copa të Europës dhe miliona tifozë — ne jemi më shumë se një klub.",
  stat1_num:   "20×",   stat1_label: "Kampionë Anglie",
  stat2_num:   "3×",    stat2_label: "Champions League",
                        stat3_label: "Lojtarë",
  stat4_num:   "1878",  stat4_label: "Themeluar",
  stat5_num:   "74,310",stat5_label: "Kapaciteti",
  results_title:   "REZULTATI I FUNDIT",
  results_btn:     "TË GJITHA NDESHJET →",
  upcoming_title:  "NDESHJET E ARDHSHME",
  upcoming_link:   "SHIKO TË GJITHA",
  squad_title_pre: "Njihuni me",
  squad_title_red: "Skuadrën Tonë",
  squad_btn:       "SHIKO FAQEN E LOJTARËVE",
  news_eyebrow:    "BLOG & MEDIA",
  news_title:      "LAJMET E FUNDIT",
  news_link:       "SHIKO TË GJITHA",
  footer_description: "",
};

export default function ManchesterUnitedHome() {
  const navigate = useNavigate();

  const isAdmin = (localStorage.getItem("role") || "").toLowerCase() === "admin";

  const [activeSeason, setActiveSeason] = useState(null);
  const [players,  setPlayers]  = useState([]);
  const [lajme,    setLajme]    = useState([]);
  const [matches,  setMatches]  = useState([]);
  const [content,  setContent]  = useState({});

  // Lajme CRUD
  const [lajmeLoaded, setLajmeLoaded] = useState(false);

  // Lajme CRUD
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({ titulli: "", pershkrimi: "", kategoria: "", foto: "", autori: "" });

  // Homepage content edit
  const [showPageEdit, setShowPageEdit] = useState(false);
  const [pageForm,     setPageForm]     = useState({});
  const [newField,     setNewField]     = useState({ key: "", value: "" });


  const fetchLajme = () =>
    api.get(LAJME_API)
      .then(r => { setLajme(Array.isArray(r.data) ? r.data : []); setLajmeLoaded(true); })
      .catch(err => { console.error("Lajme fetch error:", err); setLajmeLoaded(true); });

  const fetchContent = () =>
    api.get("/api/homepage").then(r => setContent(r.data || {})).catch(() => {});

  useEffect(() => {
    fetch("http://localhost:5001/api/seasons/active")
      .then(r => r.json()).then(d => { if (d?.emertimi) setActiveSeason(d); }).catch(() => {});
    fetch("http://localhost:5001/api/players")
      .then(r => r.json()).then(d => setPlayers(Array.isArray(d) ? d : [])).catch(() => {});
    fetchLajme();
    fetchContent();
    fetch("http://localhost:5001/api/ndeshjet")
      .then(r => r.json()).then(d => setMatches(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const c = (key, fallback = "") => content[key] || fallback;

  const openPageEdit = async () => {
    setShowPageEdit(true);
    try {
      const r = await api.get("/api/homepage");
      const fresh = r.data || {};
      const merged = {};
      Object.keys(CONTENT_DEFAULTS).forEach(k => {
        merged[k] = fresh[k] ?? CONTENT_DEFAULTS[k];
      });
      Object.keys(fresh).forEach(k => {
        if (!(k in merged)) merged[k] = fresh[k];
      });
      setPageForm(merged);
    } catch {
      const merged = {};
      Object.keys(CONTENT_DEFAULTS).forEach(k => {
        merged[k] = content[k] ?? CONTENT_DEFAULTS[k];
      });
      setPageForm(merged);
    }
  };

  const savePageEdit = async () => {
    try {
      for (const key of Object.keys(pageForm)) {
        const val = pageForm[key];
        if (val === undefined || val === null) continue;
        await api.put(`/api/homepage/${key}`, { value: String(val) });
      }
      await fetchContent();
      setShowPageEdit(false);
    } catch (err) {
      alert("Gabim gjatë ruajtjes: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteField = async (key) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish?")) return;
    try {
      await api.delete(`/api/homepage/${key}`);
      const updated = { ...pageForm };
      delete updated[key];
      setPageForm(updated);
      await fetchContent();
    } catch (err) {
      alert("Gabim gjatë fshirjes: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddField = async () => {
    if (!newField.key.trim() || !newField.value.trim()) return;
    await api.put(`/api/homepage/${newField.key.trim()}`, { value: newField.value.trim() }).catch(() => {});
    setNewField({ key: "", value: "" });
    await fetchContent();
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ titulli: "", pershkrimi: "", kategoria: "", foto: "", autori: "" });
    setShowModal(true);
  };

  const openEdit = (l) => {
    setEditId(l.id);
    setForm({ titulli: l.titulli || "", pershkrimi: l.pershkrimi || "", kategoria: l.kategoria || "", foto: l.foto || "", autori: l.autori || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish?")) return;
    await api.delete(`${LAJME_API}/${id}`).catch(() => {});
    fetchLajme();
  };

  const handleSubmit = async () => {
    try {
      if (editId) await api.put(`${LAJME_API}/${editId}`, form);
      else        await api.post(LAJME_API, form);
      setShowModal(false);
      fetchLajme();
    } catch (err) {
      alert("Gabim: " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const lastResult = [...matches]
    .filter(m => m.statusi === "Luajtur")
    .sort((a, b) => new Date(b.data_ndeshjes) - new Date(a.data_ndeshjes))[0];

  const upcoming = matches
    .filter(m => new Date(m.data_ndeshjes) >= today && m.statusi !== "Luajtur")
    .sort((a, b) => new Date(a.data_ndeshjes) - new Date(b.data_ndeshjes))
    .slice(0, 4);

  const featuredPlayer = players[0] || null;

  const fmtDate = (d) => new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });
  const fmtShort = (d) => new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" });

  return (
    <div className="mu-wrap">
      <Navbar />

      {/* ════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════ */}
      <div className="mu-hero">
        <div className="mu-hero-bg" />
        <div className="mu-hero-stripe" />

        <div className="mu-player-area">
          <img src={c("hero_image", "/homepage.jpg")} alt="Lojtari" className="mu-player-img" />
        </div>
        <div className="mu-player-fade" />

        <div className="mu-hero-content">
          <div className="mu-eyebrow">
            <span className="mu-eyebrow-badge">{activeSeason ? `Sezoni ${activeSeason.emertimi}` : c("hero_eyebrow", "Sezoni 2025/26")}</span>
            <span className="mu-eyebrow-sub">Old Trafford</span>
          </div>
          <h1 className="mu-title">
            {c("hero_title_1", "GLORY")}<br />
            {c("hero_title_2", "GLORY")}<br />
            <span className="mu-title-muted">MAN UTD</span>
          </h1>
          <p className="mu-subtitle">
            {c("hero_description", "Mirë se vini në faqen zyrtare të Manchester United. Ndiqni lajmet, ndeshjet dhe lojtarët tuaj të preferuar.")}
          </p>
          <div className="mu-actions">
            <button className="mu-cta-main" onClick={() => navigate("/ndeshjet")}>{c("hero_btn", "Shiko Ndeshjet")}</button>
            <button className="mu-cta-sec" onClick={() => navigate("/lajmet")}>Lajmet e Fundit</button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          2. ABOUT FC
      ════════════════════════════════════════ */}
      <section style={{ background: "#fff", padding: "60px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 420px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: "#cc0000", textTransform: "uppercase", display: "block", marginBottom: 12 }}>{c("about_eyebrow", "ABOUT FC")}</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(30px,4vw,48px)", color: "#1a1a1a", letterSpacing: 2, lineHeight: 1.1, marginBottom: 16 }}>
              {c("about_title_1", "Manchester United FC")}<br />
              <span style={{ color: "#cc0000" }}>{c("about_title_2", "Tradita e Fitores")}</span>
            </h2>
            <p style={{ fontSize: 14, color: "#777", lineHeight: 1.85, maxWidth: 480 }}>
              {c("about_description", "Themeluar më 1878, Manchester United është një nga klubet me historinë më të pasur në futbollin botëror. Me 20 tituj kampionë, 3 Copa të Europës dhe miliona tifozë — ne jemi më shumë se një klub.")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "BASHKOHU", path: "/ProfilePage", icon: "bi-person-plus" },
              { label: "NDESHJET", path: "/ndeshjet",    icon: "bi-calendar3" },
              { label: "TRANSFERIMET", path: "/players", icon: "bi-arrow-left-right" },
            ].map(btn => (
              <button key={btn.label} onClick={() => navigate(btn.path)}
                style={{ background: "#cc0000", border: "none", color: "#fff", padding: "13px 28px", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#aa0000"}
                onMouseLeave={e => e.currentTarget.style.background = "#cc0000"}>
                <i className={`bi ${btn.icon}`} style={{ fontSize: 13 }} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          2b. NJOFTIME CUSTOM (admin-added)
      ════════════════════════════════════════ */}
      {(() => {
        const customs = Object.entries(content).filter(([k]) => k.startsWith("custom_"));
        if (customs.length === 0) return null;
        return (
          <section style={{ background: "#1a1a1a", padding: "32px 48px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {customs.map(([key, value]) => (
                <div key={key} style={{ background: "rgba(204,0,0,0.1)", border: "1px solid rgba(204,0,0,0.25)", borderLeft: "4px solid #cc0000", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                  <i className="bi bi-megaphone-fill" style={{ color: "#cc0000", fontSize: 16, flexShrink: 0 }} />
                  <span style={{ color: "#fff", fontSize: 14, fontFamily: "'Barlow',sans-serif", fontWeight: 600, lineHeight: 1.5 }}>{value}</span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteField(key)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ════════════════════════════════════════
          3. LATEST RESULT + UPCOMING MATCHES
      ════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "64px 48px" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src="/homepage.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.18) saturate(0.4)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }} className="hp-results-grid">

          {/* Latest Result */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>{c("results_title", "REZULTATI I FUNDIT")}</span>
              {lastResult && <span style={{ fontSize: 11, color: "#888" }}>{fmtDate(lastResult.data_ndeshjes)}</span>}
            </div>
            {lastResult ? (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "36px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                {/* Home */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1 }}>
                  <img src={MU_CREST} alt="MU" style={{ height: 60 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>Manchester United</span>
                </div>
                {/* Score */}
                <div style={{ textAlign: "center", flex: "0 0 auto", padding: "0 16px" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#fff", letterSpacing: 6, lineHeight: 1 }}>
                    {lastResult.rezultati_shtepia ?? 0}
                    <span style={{ color: "#cc0000", margin: "0 4px" }}>:</span>
                    {lastResult.rezultati_jashte ?? 0}
                  </div>
                  <div style={{ fontSize: 10, color: "#666", letterSpacing: 2, textTransform: "uppercase", marginTop: 6 }}>
                    {lastResult.lloji_kompeticionit || "Premier League"}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>
                    {lastResult.stadiumi || "Old Trafford"}
                  </div>
                </div>
                {/* Away */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1 }}>
                  {lastResult.logo_kundershtarit
                    ? <img src={lastResult.logo_kundershtarit} alt="" style={{ height: 60, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                    : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: 22, color: "#fff" }}>{lastResult.ekipi_kundershtare?.slice(0, 2)}</div>}
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{lastResult.ekipi_kundershtare}</span>
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "48px 28px", textAlign: "center", color: "#444", fontSize: 13 }}>
                Nuk ka rezultate të fundit
              </div>
            )}
            <button onClick={() => navigate("/ndeshjet")}
              style={{ marginTop: 16, background: "#cc0000", border: "none", color: "#fff", padding: "11px 24px", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#aa0000"}
              onMouseLeave={e => e.currentTarget.style.background = "#cc0000"}>
              {c("results_btn", "TË GJITHA NDESHJET →")}
            </button>
          </div>

          {/* Upcoming Matches */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>{c("upcoming_title", "NDESHJET E ARDHSHME")}</span>
              <span onClick={() => navigate("/ndeshjet")} style={{ fontSize: 11, color: "#cc0000", cursor: "pointer", fontWeight: 700 }}>{c("upcoming_link", "SHIKO TË GJITHA")}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {upcoming.length > 0 ? upcoming.map(m => (
                <div key={m.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, transition: "background 0.2s", cursor: "pointer" }}
                  onClick={() => navigate("/ndeshjet")}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(204,0,0,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                  <img src={MU_CREST} alt="MU" style={{ height: 28 }} />
                  <span style={{ fontSize: 10, color: "#555", letterSpacing: 2, fontWeight: 700 }}>VS</span>
                  {m.logo_kundershtarit
                    ? <img src={m.logo_kundershtarit} alt="" style={{ height: 28, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                    : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{m.ekipi_kundershtare?.slice(0, 2)}</div>}
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Barlow', sans-serif" }}>{m.ekipi_kundershtare}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "#cc0000", fontWeight: 700 }}>{fmtShort(m.data_ndeshjes)}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>{m.lloji_kompeticionit || "Premier League"}</div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "32px 0", color: "#444", fontSize: 13, textAlign: "center" }}>Nuk ka ndeshje të planifikuara</div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          4. OUR SQUAD
      ════════════════════════════════════════ */}
      <section style={{ background: "#f2f2f2", padding: "64px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: "#cc0000", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              {activeSeason ? `SEZON ${activeSeason.emertimi}` : "SEZON 2025/26"}
            </span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(30px,4vw,48px)", color: "#1a1a1a", letterSpacing: 3, lineHeight: 1, margin: 0 }}>
              {c("squad_title_pre", "Njihuni me")} <span style={{ color: "#cc0000" }}>{c("squad_title_red", "Skuadrën Tonë")}</span>
            </h2>
          </div>

          {/* Cards grid */}
          {players.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 36 }}>
                {(() => {
                  const priority = players.filter(p => p.numri_faneles === 9 || p.numri_faneles === 17);
                  const rest = players.filter(p => p.numri_faneles !== 9 && p.numri_faneles !== 17)
                    .sort((a, b) => {
                      const order = { Sulmues: 0, Mesfushor: 1, Mbrojtës: 2, Portier: 3 };
                      return (order[a.pozicioni] ?? 9) - (order[b.pozicioni] ?? 9);
                    });
                  return [...priority, ...rest].slice(0, 4);
                })().map((p) => (
                  <div key={p.id}
                    style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden", transition: "transform 0.22s, box-shadow 0.22s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.08)"; }}>

                    {/* Card image area */}
                    <div style={{ position: "relative", height: 200, overflow: "hidden", background: "linear-gradient(135deg, #1a0000 0%, #2d0000 60%, #111 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* Jersey number watermark */}
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 130, color: "rgba(204,0,0,0.18)", lineHeight: 1, userSelect: "none", position: "relative", zIndex: 1 }}>
                        {p.numri_faneles || "–"}
                      </div>
                      {/* Player photo */}
                      <img
                        src={p.foto_url || slugPhoto(p.emri, p.mbiemri)}
                        alt={p.mbiemri}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", zIndex: 2 }}
                        onError={e => e.target.style.display = "none"}
                      />
                      {/* Gradient overlay */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)", zIndex: 3, pointerEvents: "none" }} />
                      {/* MU crest faint */}
                      <img src={MU_CREST} alt="" style={{ position: "absolute", right: 16, bottom: 12, height: 48, opacity: 0.12, zIndex: 4 }} />
                      {/* Position badge */}
                      <div style={{ position: "absolute", top: 14, left: 0, zIndex: 5 }}>
                        <span style={{ background: "#cc0000", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "5px 14px", textTransform: "uppercase" }}>
                          {p.pozicioni || "Lojtar"}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "20px 22px 24px" }}>
                      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#1a1a1a", letterSpacing: 1.5, lineHeight: 1.2, marginBottom: 6 }}>
                        {p.emri} {p.mbiemri}
                      </h3>
                      <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
                        {p.kombesia && <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>{p.kombesia}</span>}
                        {p.numri_faneles && <span style={{ fontSize: 11, color: "#aaa" }}>#{p.numri_faneles}</span>}
                        {p.mosha && <span style={{ fontSize: 11, color: "#aaa" }}>{p.mosha} vj</span>}
                      </div>
                      <button onClick={() => navigate("/players")}
                        style={{ background: "transparent", border: "1.5px solid #cc0000", color: "#cc0000", padding: "7px 18px", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#cc0000"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#cc0000"; }}>
                        Shiko Më Shumë <i className="bi bi-arrow-right" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div style={{ textAlign: "center" }}>
                <button onClick={() => navigate("/players")}
                  style={{ background: "#cc0000", border: "none", color: "#fff", padding: "13px 36px", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s", display: "inline-flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#aa0000"}
                  onMouseLeave={e => e.currentTarget.style.background = "#cc0000"}>
                  <i className="bi bi-people-fill" /> {c("squad_btn", "SHIKO FAQEN E LOJTARËVE")}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb", fontSize: 14 }}>
              Nuk ka lojtarë të regjistruar aktualisht.
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. LATEST NEWS
      ════════════════════════════════════════ */}
      <section style={{ background: "#fff", padding: "72px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, borderBottom: "2px solid #f0f0f0", paddingBottom: 24 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: "#cc0000", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{c("news_eyebrow", "BLOG & MEDIA")}</span>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,46px)", color: "#1a1a1a", letterSpacing: 2, lineHeight: 1, margin: 0 }}>{c("news_title", "LAJMET E FUNDIT")}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 4 }}>
              {isAdmin && (
                <button onClick={openAdd}
                  style={{ background: "#cc0000", border: "none", color: "#fff", padding: "9px 20px", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
                  <i className="bi bi-plus-lg" /> SHTO LAJM
                </button>
              )}
              <span onClick={() => navigate("/lajmet")}
                style={{ fontSize: 11, fontWeight: 700, color: "#cc0000", letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {c("news_link", "SHIKO TË GJITHA")} <i className="bi bi-arrow-right" />
              </span>
            </div>
          </div>

          {!lajmeLoaded ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#ccc", fontSize: 13 }}>Duke ngarkuar lajmet...</div>
          ) : lajme.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#ccc", fontSize: 13 }}>
              {isAdmin ? "Nuk ka lajme — shto lajmin e parë me butonin lartë." : "Nuk ka lajme aktualisht."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }} className="hp-news-grid">

              {/* Featured card — left, tall */}
              {lajme[0] && (() => {
                const l = lajme[0];
                return (
                  <div onClick={() => navigate("/lajmet")}
                    style={{ position: "relative", overflow: "hidden", cursor: "pointer", minHeight: 460, background: "#111", gridRow: "1 / span 2" }}
                    onMouseEnter={e => e.currentTarget.querySelector(".news-img")?.style && (e.currentTarget.querySelector(".news-img").style.transform = "scale(1.04)")}
                    onMouseLeave={e => e.currentTarget.querySelector(".news-img")?.style && (e.currentTarget.querySelector(".news-img").style.transform = "scale(1)")}>
                    {l.foto
                      ? <img className="news-img" src={l.foto} alt={l.titulli} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, transition: "transform 0.4s ease" }} onError={e => e.target.style.display = "none"} />
                      : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1a0000,#cc0000)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={MU_CREST} alt="" style={{ height: 80, opacity: 0.15 }} />
                        </div>}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
                    <div style={{ position: "absolute", inset: 0, padding: "28px 28px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        {l.kategoria && <span style={{ background: "#cc0000", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "5px 14px", textTransform: "uppercase" }}>{l.kategoria}</span>}
                        {isAdmin && (
                          <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(l)} style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", padding: "5px 10px", fontSize: 11, cursor: "pointer", borderRadius: 3 }}><i className="bi bi-pencil" /></button>
                            <button onClick={() => handleDelete(l.id)} style={{ background: "rgba(204,0,0,0.7)", border: "none", color: "#fff", padding: "5px 10px", fontSize: 11, cursor: "pointer", borderRadius: 3 }}><i className="bi bi-trash" /></button>
                          </div>
                        )}
                      </div>
                      <div>
                        {l.created_at && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>{fmtDate(l.created_at)}</div>}
                        <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(22px,2.5vw,32px)", color: "#fff", letterSpacing: 1.5, lineHeight: 1.15, marginBottom: 14 }}>{l.titulli}</h3>
                        {l.pershkrimi && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 16 }}>{l.pershkrimi.slice(0, 100)}...</p>}
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#cc0000", letterSpacing: 1.5, textTransform: "uppercase" }}>LEXO MË SHUMË →</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Right side — 2 smaller horizontal cards */}
              {lajme.slice(1, 3).map((l) => (
                <div key={l.id} onClick={() => navigate("/lajmet")}
                  style={{ background: "#fff", border: "1px solid #f0f0f0", cursor: "pointer", display: "flex", overflow: "hidden", transition: "box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  {/* Thumb */}
                  <div style={{ flex: "0 0 160px", position: "relative", overflow: "hidden", background: "#111" }}>
                    {l.foto
                      ? <img src={l.foto} alt={l.titulli} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a0000,#cc0000)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={MU_CREST} alt="" style={{ height: 36, opacity: 0.2 }} />
                        </div>}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.05) 100%)" }} />
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        {l.kategoria && <span style={{ fontSize: 8, fontWeight: 700, color: "#cc0000", letterSpacing: 2, textTransform: "uppercase", background: "rgba(204,0,0,0.08)", padding: "3px 8px" }}>{l.kategoria}</span>}
                        {l.created_at && <span style={{ fontSize: 10, color: "#bbb" }}>{fmtDate(l.created_at)}</span>}
                      </div>
                      <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#1a1a1a", letterSpacing: 1, lineHeight: 1.25, marginBottom: 8 }}>{l.titulli}</h3>
                      {l.pershkrimi && <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.65, margin: 0 }}>{l.pershkrimi.slice(0, 70)}...</p>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#cc0000", letterSpacing: 1, textTransform: "uppercase" }}>LEXO →</span>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEdit(l)} style={{ background: "rgba(234,179,8,0.1)", border: "none", color: "#b8860b", padding: "4px 10px", fontSize: 11, cursor: "pointer", borderRadius: 3 }}><i className="bi bi-pencil" /></button>
                          <button onClick={() => handleDelete(l.id)} style={{ background: "rgba(239,68,68,0.08)", border: "none", color: "#cc0000", padding: "4px 10px", fontSize: 11, cursor: "pointer", borderRadius: 3 }}><i className="bi bi-trash" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. STATS STRIP
      ════════════════════════════════════════ */}
      <section style={{ background: "#cc0000", padding: "40px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {[
            { num: c("stat1_num", "20×"),          label: c("stat1_label", "Kampionë Anglie") },
            { num: c("stat2_num", "3×"),            label: c("stat2_label", "Champions League") },
            { num: players.length || "–",           label: c("stat3_label", "Lojtarë") },
            { num: c("stat4_num", "1878"),           label: c("stat4_label", "Themeluar") },
            { num: c("stat5_num", "74,310"),         label: c("stat5_label", "Kapaciteti") },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hp-results-grid { grid-template-columns: 1fr !important; }
          .hp-team-grid { flex-direction: column !important; }
          .hp-team-grid > div:first-child { flex: none !important; height: 260px !important; }
        }
      `}</style>

      {/* ── Floating Admin Edit Button ── */}
      {isAdmin && (
        <button onClick={openPageEdit}
          style={{ position: "fixed", bottom: 90, right: 28, zIndex: 1000, background: "#cc0000", border: "none", color: "#fff", padding: "12px 20px", borderRadius: 4, fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
          <i className="bi bi-pencil-square" style={{ fontSize: 15 }} /> EDITO FAQEN
        </button>
      )}

      {/* ── Page Content Edit Modal (Admin only) ── */}
      <Modal show={showPageEdit} onHide={() => setShowPageEdit(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: "#1a1a1a", borderBottom: "1px solid #333" }}>
          <Modal.Title style={{ color: "#fff", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, fontSize: 22 }}>
            EDITO FAQEN KRYESORE
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#1a1a1a", maxHeight: "75vh", overflowY: "auto" }}>

          {/* ── Seksionet standarde ── */}
          {[
            {
              section: "HERO — FOTO DHE TEKSTI",
              fields: [
                { key: "hero_image",       label: "URL e fotos hero" },
                { key: "hero_eyebrow",     label: "Eyebrow (teksti i vogël)" },
                { key: "hero_title_1",     label: "Titulli rreshti 1" },
                { key: "hero_title_2",     label: "Titulli rreshti 2 (i kuq)" },
                { key: "hero_description", label: "Përshkrimi", textarea: true },
                { key: "hero_btn",         label: "Teksti i butonit" },
              ]
            },
            {
              section: "ABOUT FC",
              fields: [
                { key: "about_eyebrow",     label: "Eyebrow" },
                { key: "about_title_1",     label: "Titulli rreshti 1" },
                { key: "about_title_2",     label: "Titulli rreshti 2 (i kuq)" },
                { key: "about_description", label: "Përshkrimi", textarea: true },
              ]
            },
            {
              section: "STATISTIKAT",
              fields: [
                { key: "stat1_num",   label: "Stat 1 — Numri" },
                { key: "stat1_label", label: "Stat 1 — Etiketa" },
                { key: "stat2_num",   label: "Stat 2 — Numri" },
                { key: "stat2_label", label: "Stat 2 — Etiketa" },
                { key: "stat3_label", label: "Stat 3 — Etiketa (numri: lojtarët)" },
                { key: "stat4_num",   label: "Stat 4 — Numri" },
                { key: "stat4_label", label: "Stat 4 — Etiketa" },
                { key: "stat5_num",   label: "Stat 5 — Numri" },
                { key: "stat5_label", label: "Stat 5 — Etiketa" },
              ]
            },
            {
              section: "REZULTATET & NDESHJET",
              fields: [
                { key: "results_title",  label: "Titulli — Rezultati i fundit" },
                { key: "results_btn",    label: "Butoni — Të gjitha ndeshjet" },
                { key: "upcoming_title", label: "Titulli — Ndeshjet e ardhshme" },
                { key: "upcoming_link",  label: "Linku — Shiko të gjitha" },
              ]
            },
            {
              section: "SKUADRA",
              fields: [
                { key: "squad_title_pre", label: "Titulli — Pjesa e parë" },
                { key: "squad_title_red", label: "Titulli — Pjesa e kuqe" },
                { key: "squad_btn",       label: "Butoni — Shiko lojtarët" },
              ]
            },
            {
              section: "LAJMET",
              fields: [
                { key: "news_eyebrow", label: "Eyebrow (Blog & Media)" },
                { key: "news_title",   label: "Titulli" },
                { key: "news_link",    label: "Linku — Shiko të gjitha" },
              ]
            },
            {
              section: "FOOTER",
              fields: [
                { key: "footer_description", label: "Përshkrimi i klubit", textarea: true },
              ]
            },
          ].map(({ section, fields }) => (
            <div key={section}>
              <div style={{ color: "#cc0000", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14, marginTop: 24, paddingBottom: 8, borderBottom: "1px solid #2a2a2a" }}>{section}</div>
              <Form>
                {fields.map(f => (
                  <Form.Group className="mb-3" key={f.key}>
                    <Form.Label style={{ color: "#aaa", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{f.label.toUpperCase()}</Form.Label>
                    {f.textarea
                      ? <Form.Control as="textarea" rows={2} value={pageForm[f.key] || ""} onChange={e => setPageForm({ ...pageForm, [f.key]: e.target.value })} style={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                      : <Form.Control value={pageForm[f.key] || ""} onChange={e => setPageForm({ ...pageForm, [f.key]: e.target.value })} style={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                    }
                  </Form.Group>
                ))}
              </Form>
            </div>
          ))}

          {/* ── Njoftime Custom ── */}
          <div style={{ marginTop: 24 }}>
            <div style={{ color: "#cc0000", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #2a2a2a" }}>
              NJOFTIME CUSTOM
            </div>

            {/* Lista e njoftimeve ekzistuese */}
            {Object.entries(content).filter(([k]) => k.startsWith("custom_")).map(([key, value]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(204,0,0,0.08)", border: "1px solid rgba(204,0,0,0.2)", borderLeft: "3px solid #cc0000", padding: "10px 14px", marginBottom: 8 }}>
                <i className="bi bi-megaphone-fill" style={{ color: "#cc0000", fontSize: 13, flexShrink: 0 }} />
                <span style={{ flex: 1, color: "#ddd", fontSize: 13 }}>{value}</span>
                <button onClick={() => handleDeleteField(key)} type="button"
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15, flexShrink: 0 }}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            ))}

            {/* Shto njoftim të ri */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Form.Control
                placeholder="Teksti i njoftimit..."
                value={newField.value}
                onChange={e => setNewField({ key: `custom_${Date.now()}`, value: e.target.value })}
                style={{ background: "#111", border: "1px solid #333", color: "#fff", fontSize: 13 }}
              />
              <button onClick={handleAddField} type="button"
                style={{ background: "#cc0000", border: "none", color: "#fff", padding: "8px 18px", fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                + SHTO
              </button>
            </div>
          </div>

        </Modal.Body>
        <Modal.Footer style={{ background: "#1a1a1a", borderTop: "1px solid #333" }}>
          <Button variant="secondary" onClick={() => setShowPageEdit(false)}>Anulo</Button>
          <Button onClick={savePageEdit} style={{ background: "#cc0000", border: "none", fontWeight: 700, letterSpacing: 1 }}>
            Ruaj Ndryshimet
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── CRUD Modal (Admin only) ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ background: "#1a1a1a", borderBottom: "1px solid #333" }}>
          <Modal.Title style={{ color: "#fff", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, fontSize: 22 }}>
            {editId ? "EDITO LAJMIN" : "SHTO LAJM TË RI"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#1a1a1a" }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#aaa", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>TITULLI</Form.Label>
              <Form.Control value={form.titulli} onChange={e => setForm({ ...form, titulli: e.target.value })}
                style={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#aaa", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>PËRSHKRIMI</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.pershkrimi} onChange={e => setForm({ ...form, pershkrimi: e.target.value })}
                style={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#aaa", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>KATEGORIA</Form.Label>
              <Form.Select value={form.kategoria} onChange={e => setForm({ ...form, kategoria: e.target.value })}
                style={{ background: "#111", border: "1px solid #333", color: "#fff" }}>
                <option value="">-- Zgjidh --</option>
                {KATEGORITE.map(k => <option key={k} value={k}>{k}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#aaa", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>FOTO (URL)</Form.Label>
              <Form.Control value={form.foto} onChange={e => setForm({ ...form, foto: e.target.value })}
                style={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#aaa", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>AUTORI</Form.Label>
              <Form.Control value={form.autori} onChange={e => setForm({ ...form, autori: e.target.value })}
                style={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: "#1a1a1a", borderTop: "1px solid #333" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Anulo</Button>
          <Button onClick={handleSubmit}
            style={{ background: "#cc0000", border: "none", fontWeight: 700, letterSpacing: 1 }}>
            {editId ? "Ruaj Ndryshimet" : "Shto Lajmin"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
