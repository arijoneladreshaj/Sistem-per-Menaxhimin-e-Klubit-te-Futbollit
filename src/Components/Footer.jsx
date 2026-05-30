import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "bootstrap-icons/font/bootstrap-icons.css";

const MU_CREST = "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg";

const SOCIAL = [
  { icon: "bi-instagram",  label: "Instagram", href: "https://www.instagram.com/manutd/?hl=en" },
  { icon: "bi-twitter-x",  label: "X",         href: "https://x.com/ManUtd" },
  { icon: "bi-facebook",   label: "Facebook",  href: "https://www.facebook.com/manchesterunited" },
  { icon: "bi-youtube",    label: "YouTube",   href: "https://www.youtube.com/manutd" },
  { icon: "bi-tiktok",     label: "TikTok",    href: "https://www.tiktok.com/@manutd" },
];

const COL_LINKS = [
  {
    heading: "Klubi",
    items: [
      { label: "Lajme",    path: "/lajmet"   },
      { label: "Ndeshjet", path: "/ndeshjet" },
      { label: "Lojtarët", path: "/players"  },
      { label: "Sezoni",   path: "/sezonet"  },
    ],
  },
  {
    heading: "Tifozët",
    items: [
      { label: "Store",     path: "/Store"                 },
      { label: "Biletat",   path: "/ndeshjet?tab=fixtures" },
      { label: "Njoftimet", path: "/notifications"         },
      { label: "Profili",   path: "/ProfilePage"           },
    ],
  },
];

function fmtDate(d) {
  return new Date(d).toLocaleDateString("sq-AL", { weekday: "short", day: "2-digit", month: "short" });
}

const FOOTER_DEFAULTS = {
  footer_description: "Platforma zyrtare e Manchester United — ndiqni ndeshjet, lajmet dhe historikun e madh të klubit.",
  footer_address:     "Sir Matt Busby Way, M16 0RA",
  footer_phone:       "+44 161 868 8000",
  footer_email:       "info@manutd.com",
  footer_hours:       "Hën – Premte · 09:30 – 17:00",
};

export default function Footer() {
  const navigate   = useNavigate();
  const year       = new Date().getFullYear();
  const [contactForm, setContactForm] = useState({ emri: "", email: "", mesazhi: "" });
  const [toast,     setToast]     = useState(false);
  const [toastMsg,  setToastMsg]  = useState("");
  const [toastOk,   setToastOk]   = useState(true);
  const [showTop,   setShowTop]   = useState(false);
  const [nextMatch, setNextMatch] = useState(null);
  const [fc,        setFc]        = useState({});

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    api.get("/api/homepage")
      .then(res => setFc(res.data || {}))
      .catch(() => {});
  }, []);

  const f = (key) => fc[key] || FOOTER_DEFAULTS[key] || "";

  useEffect(() => {
    api.get("/api/ndeshjet")
      .then(res => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const nxt = res.data
          .filter(m => new Date(m.data_ndeshjes) >= today && m.statusi !== "Luajtur")
          .sort((a, b) => new Date(a.data_ndeshjes) - new Date(b.data_ndeshjes));
        if (nxt.length > 0) setNextMatch(nxt[0]);
      })
      .catch(() => {});
  }, []);

  const handleContact = async () => {
    const { emri, email, mesazhi } = contactForm;
    if (!emri || !email || !mesazhi) return;
    try {
      await api.post("/api/contact", contactForm);
      setContactForm({ emri: "", email: "", mesazhi: "" });
      setToastMsg("Mesazhi u dërgua me sukses!"); setToastOk(true);
    } catch (err) {
      setToastMsg(err.response?.data?.message || "Gabim. Provoni sërish."); setToastOk(false);
    }
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  return (
    <>
      <footer style={{ fontFamily: "'Barlow', sans-serif", background: "#cc0000" }}>

        {/* ── NEXT MATCH STRIP ── */}
        {nextMatch && (
          <div style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(0,0,0,0.15)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 48px", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", flexShrink: 0 }}>
                Ndeshja e Ardhshme
              </span>

              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={MU_CREST} alt="MU" style={{ height: 22 }} />
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 1.5, color: "#fff" }}>Man United</span>
                </div>

                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 2, padding: "2px 8px", border: "1px solid rgba(255,255,255,0.2)" }}>VS</span>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {nextMatch.logo_kundershtarit && (
                    <img src={nextMatch.logo_kundershtarit} alt="" style={{ height: 22, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
                  )}
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 1.5, color: "#fff" }}>{nextMatch.ekipi_kundershtare}</span>
                </div>

                <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="bi bi-calendar3" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{fmtDate(nextMatch.data_ndeshjes)}</span>
                </div>

                {nextMatch.lloji_kompeticionit && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, textTransform: "uppercase" }}>{nextMatch.lloji_kompeticionit}</span>
                )}
              </div>

              <button onClick={() => navigate(`/SectorPage/${nextMatch.id}`)}
                style={{ background: "#fff", border: "none", color: "#cc0000", fontSize: 10, fontWeight: 900, letterSpacing: 1.5, padding: "8px 18px", cursor: "pointer", textTransform: "uppercase", flexShrink: 0, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#cc0000"; }}>
                Bli Biletë →
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 48px 40px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 52 }} className="footer-main-grid">

          {/* COL 1 — Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <img src={MU_CREST} alt="MUFC" style={{ height: 52 }} />
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, lineHeight: 1.15, color: "#fff" }}>Manchester</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, lineHeight: 1.15, color: "rgba(255,255,255,0.75)" }}>United FC</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>Est. 1878</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.9, marginBottom: 26, maxWidth: 260 }}>
              {f("footer_description")}
            </p>

            <div style={{ marginBottom: 10, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Na ndiqni</div>
            <div style={{ display: "flex", gap: 8 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{ width: 34, height: 34, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.8)", fontSize: 14, textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#cc0000"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <i className={`bi ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* COL 2 & 3 — Links */}
          {COL_LINKS.map(col => (
            <div key={col.heading}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 3, color: "#fff", marginBottom: 20, textTransform: "uppercase", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                {col.heading}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {col.items.map(l => (
                  <li key={l.label}>
                    <button onClick={() => navigate(l.path)}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 600, letterSpacing: 0.3, transition: "all 0.18s", display: "flex", alignItems: "center", gap: 8 }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.paddingLeft = "5px"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.paddingLeft = "0"; }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>▸</span>{l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* COL 4 — Contact Form */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 3, color: "#fff", marginBottom: 20, textTransform: "uppercase", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
              Na Kontaktoni
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                placeholder="Emri juaj"
                value={contactForm.emri}
                onChange={e => setContactForm({ ...contactForm, emri: e.target.value })}
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, padding: "9px 13px", fontFamily: "'Barlow',sans-serif", outline: "none", width: "100%" }}
              />
              <input
                placeholder="Email juaj"
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, padding: "9px 13px", fontFamily: "'Barlow',sans-serif", outline: "none", width: "100%" }}
              />
              <textarea
                placeholder="Mesazhi juaj..."
                value={contactForm.mesazhi}
                onChange={e => setContactForm({ ...contactForm, mesazhi: e.target.value })}
                rows={3}
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, padding: "9px 13px", fontFamily: "'Barlow',sans-serif", outline: "none", width: "100%", resize: "none" }}
              />
              <button onClick={handleContact}
                style={{ background: "#fff", color: "#cc0000", border: "none", padding: "10px", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#cc0000"; }}>
                <i className="bi bi-send-fill" /> DËRGO MESAZHIN
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={MU_CREST} alt="" style={{ height: 16, opacity: 0.6 }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                © {year} Manchester United FC · Të gjitha të drejtat e rezervuara
              </span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privatësia", "Kushtet", "Cookies"].map(t => (
                <span key={t}
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontWeight: 600, letterSpacing: 0.3, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 24, right: 80, zIndex: 9999, background: "#111", border: "1px solid #1e1e1e", borderLeft: `3px solid ${toastOk ? "#4ade80" : "#ef4444"}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", fontFamily: "'Barlow', sans-serif" }}>
            <i className={`bi ${toastOk ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`} style={{ color: toastOk ? "#4ade80" : "#ef4444", fontSize: 15 }} />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{toastMsg}</span>
          </div>
        )}

        <style>{`
          @media (max-width: 960px) { .footer-main-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; } }
          @media (max-width: 560px) { .footer-main-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </footer>

      {/* Back to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Kthehu lart"
        style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9998, width: 40, height: 40, background: "#cc0000", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(204,0,0,0.4)", transition: "all 0.3s", opacity: showTop ? 1 : 0, pointerEvents: showTop ? "auto" : "none", transform: showTop ? "translateY(0)" : "translateY(12px)" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#aa0000"; e.currentTarget.style.transform = "translateY(-3px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#cc0000"; e.currentTarget.style.transform = showTop ? "translateY(0)" : "translateY(12px)"; }}>
        <i className="bi bi-chevron-up" />
      </button>
    </>
  );
}
