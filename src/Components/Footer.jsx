import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";

const SPONSORS = ["Adidas", "TeamViewer", "Kohler", "DXC Tech", "Tezos", "Qualcomm"];

const SOCIAL = [
  { icon: "bi-instagram", label: "Instagram", href: "https://www.instagram.com/manutd/?hl=en"  },
  { icon: "bi-twitter-x", label: "X",         href: "https://x.com/ManUtd"                      },
  { icon: "bi-facebook",  label: "Facebook",  href: "https://www.facebook.com/manchesterunited" },
  { icon: "bi-youtube",   label: "YouTube",   href: "https://www.youtube.com/manutd"             },
  { icon: "bi-tiktok",    label: "TikTok",    href: "https://www.tiktok.com/@manutd"             },
];

const LINKS = [
  { label: "Lajme",     path: "/lajmet"   },
  { label: "Ndeshjet",  path: "/ndeshjet" },
  { label: "Lojtarët",  path: "/players"  },
  { label: "Store",     path: "/Store"    },
  { label: "Biletat",   path: "/"         },
  { label: "Sezoni",    path: "/sezonet"  },
];

const STADIUM_HOURS = [
  { day: "E Hënë – E Premte", hours: "09:30 – 17:00" },
  { day: "E Shtunë",          hours: "09:30 – 16:00" },
  { day: "E Diel",            hours: "10:00 – 16:00" },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("sq-AL", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const [email, setEmail]       = useState("");
  const [toast, setToast]       = useState(false);
  const [showTop, setShowTop]   = useState(false);
  const [nextMatch, setNextMatch] = useState(null);

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch next scheduled match
  useEffect(() => {
    axios.get("http://localhost:5001/api/ndeshjet")
      .then(res => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = res.data
          .filter(m => {
            const d = new Date(m.data_ndeshjes);
            return d >= today && (m.statusi === "Planifikuar" || m.statusi === "Scheduled");
          })
          .sort((a, b) => new Date(a.data_ndeshjes) - new Date(b.data_ndeshjes));
        if (upcoming.length > 0) setNextMatch(upcoming[0]);
      })
      .catch(() => {});
  }, []);

  const handleNewsletter = () => {
    if (!email.includes("@")) return;
    setEmail("");
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <>
      <footer style={{ position: "relative", overflow: "hidden", fontFamily: "'Barlow', sans-serif" }}>

        {/* ── BACKGROUND ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "linear-gradient(160deg, #cc0000 0%, #8b0000 25%, #4a0000 55%, #1a0000 80%, #0a0000 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(0,0,0,0.08) 40px, rgba(0,0,0,0.08) 80px)",
        }} />
        <img
          src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
          alt="" aria-hidden="true"
          style={{
            position: "absolute", right: 60, bottom: 40, zIndex: 1,
            height: 260, opacity: 0.06, pointerEvents: "none",
            filter: "grayscale(1) brightness(10)",
          }}
        />

        {/* ── NEXT MATCH BANNER ── */}
        {nextMatch && (
          <div style={{
            position: "relative", zIndex: 2,
            background: "rgba(0,0,0,0.35)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            padding: "16px 40px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "rgba(255,200,200,0.7)", textTransform: "uppercase" }}>
              Ndeshja e Ardhshme
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Man United */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
                  alt="MU" style={{ height: 28, filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
                  Manchester United
                </span>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 2,
              }}>VS</div>

              {/* Opponent */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {nextMatch.logo_kundershtarit && (
                  <img src={nextMatch.logo_kundershtarit} alt="" style={{ height: 28, objectFit: "contain" }}
                    onError={e => { e.target.style.display = "none"; }} />
                )}
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
                  {nextMatch.ekipi_kundershtare}
                </span>
              </div>
            </div>

            {/* Date + Competition */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <i className="bi bi-calendar3" style={{ color: "rgba(255,200,200,0.7)", fontSize: 11 }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                  {formatDate(nextMatch.data_ndeshjes)}
                </span>
              </div>
              {nextMatch.lloji_kompeticionit && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="bi bi-trophy" style={{ color: "rgba(255,200,200,0.7)", fontSize: 11 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                    {nextMatch.lloji_kompeticionit}
                  </span>
                </div>
              )}
              <button onClick={() => navigate("/ndeshjet?tab=fixtures")} style={{
                background: "rgba(204,0,0,0.7)", border: "none", color: "#fff",
                fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "5px 12px",
                cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#cc0000"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(204,0,0,0.7)"}
              >
                Bli Biletat →
              </button>
            </div>
          </div>
        )}

        {/* ── SPONSORS BAR ── */}
        <div style={{
          position: "relative", zIndex: 2,
          background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "14px 40px",
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center",
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginRight: 12 }}>
            Partnerët Zyrtarë
          </span>
          {SPONSORS.map(s => (
            <span key={s} style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "5px 16px",
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              color: "rgba(255,255,255,0.7)", textTransform: "uppercase",
              transition: "all 0.2s", cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >{s}</span>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "52px 40px 36px" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 48 }}>

            {/* COL 1 — Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
                  alt="MUFC" style={{ height: 60, filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.5))" }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>Manchester</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, lineHeight: 1, color: "#ffd0d0" }}>United FC</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 22, maxWidth: 260 }}>
                Themeluar më 1878, Manchester United është një nga klubet më të titulluara dhe më të njohura në botë.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SOCIAL.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    style={{
                      width: 38, height: 38,
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(255,255,255,0.8)", fontSize: 16,
                      textDecoration: "none", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <i className={`bi ${s.icon}`} />
                  </a>
                ))}
              </div>
            </div>

            {/* COL 2 — Quick Links */}
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3, color: "#ffd0d0", marginBottom: 22, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 10 }}>
                Navigim
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                {LINKS.map(l => (
                  <li key={l.label}>
                    <button onClick={() => navigate(l.path)} style={{
                      background: "none", border: "none", padding: 0, cursor: "pointer",
                      color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "'Barlow', sans-serif",
                      fontWeight: 600, letterSpacing: 0.5, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.paddingLeft = "4px"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.paddingLeft = "0"; }}
                    >
                      <span style={{ color: "rgba(255,210,210,0.6)", fontSize: 10 }}>›</span>{l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* COL 3 — Club Info */}
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3, color: "#ffd0d0", marginBottom: 22, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 10 }}>
                Klubi
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {[
                  { icon: "bi-calendar3",  text: "Themeluar 1878"           },
                  { icon: "bi-geo-alt",    text: "Old Trafford, Manchester" },
                  { icon: "bi-globe2",     text: "Premier League"           },
                  { icon: "bi-people",     text: "74,310 kapacitet"         },
                  { icon: "bi-trophy",     text: "20× Kampion Anglie"       },
                  { icon: "bi-star",       text: "3× Champions League"      },
                ].map(item => (
                  <div key={item.icon} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <i className={`bi ${item.icon}`} style={{ color: "rgba(255,200,200,0.8)", fontSize: 13, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COL 4 — Contact + Hours + Map */}
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3, color: "#ffd0d0", marginBottom: 22, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 10 }}>
                Kontakti
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "bi-envelope",  text: "info@manutd.com"         },
                  { icon: "bi-telephone", text: "+44 161 868 8000"         },
                  { icon: "bi-pin-map",   text: "Sir Matt Busby Way, M16 0RA" },
                ].map(item => (
                  <div key={item.icon} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <i className={`bi ${item.icon}`} style={{ color: "rgba(255,200,200,0.8)", fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 600, lineHeight: 1.6 }}>{item.text}</span>
                  </div>
                ))}

                {/* Map link */}
                <a
                  href="https://www.google.com/maps/place/Old+Trafford/@53.4631,-2.2913,17z"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    marginTop: 4, padding: "6px 12px",
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                    color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700,
                    textDecoration: "none", letterSpacing: 0.5, transition: "all 0.2s", width: "fit-content",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                >
                  <i className="bi bi-map" style={{ fontSize: 12 }} />
                  Hap në Google Maps
                </a>
              </div>

              {/* Stadium Hours */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,200,200,0.7)", textTransform: "uppercase", marginBottom: 10 }}>
                  Orari i Stadiumit
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {STADIUM_HOURS.map(h => (
                    <div key={h.day} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{h.day}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,200,200,0.85)", fontWeight: 700 }}>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 10 }}>
                  Newsletter
                </div>
                <div style={{ display: "flex", gap: 0 }}>
                  <input
                    placeholder="Email juaj..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleNewsletter()}
                    style={{
                      flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)",
                      borderRight: "none", color: "#fff", fontSize: 12, padding: "9px 12px",
                      fontFamily: "'Barlow', sans-serif", outline: "none",
                    }}
                  />
                  <button onClick={handleNewsletter} style={{
                    background: "rgba(255,255,255,0.9)", color: "#cc0000", border: "none",
                    padding: "9px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.9)"}
                  >
                    <i className="bi bi-send-fill" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          position: "relative", zIndex: 2,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.3)",
          padding: "14px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5 }}>
            © {year} Manchester United FC · Të gjitha të drejtat e rezervuara
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privatësia", "Kushtet e Përdorimit", "Cookies"].map(t => (
              <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", cursor: "pointer", fontWeight: 600, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >{t}</span>
            ))}
          </div>
        </div>

        {toast && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            background: "#1a0000", border: "1px solid rgba(255,255,255,0.12)",
            borderLeft: "4px solid #4ade80", padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontFamily: "'Barlow', sans-serif",
          }}>
            <i className="bi bi-check-circle-fill" style={{ color: "#4ade80", fontSize: 18 }} />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>U regjistruat me sukses në newsletter!</span>
          </div>
        )}

        <style>{`
          @media (max-width: 900px) {
            .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          }
          @media (max-width: 580px) {
            .footer-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </footer>

      {/* ── BACK TO TOP BUTTON ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Kthehu lart"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9998,
          width: 44, height: 44,
          background: "#cc0000", border: "2px solid rgba(255,255,255,0.25)",
          color: "#fff", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(204,0,0,0.5)",
          transition: "all 0.3s",
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? "auto" : "none",
          transform: showTop ? "translateY(0)" : "translateY(12px)",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#aa0000"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#cc0000"; e.currentTarget.style.transform = showTop ? "translateY(0)" : "translateY(12px)"; }}
      >
        <i className="bi bi-chevron-up" />
      </button>
    </>
  );
}
