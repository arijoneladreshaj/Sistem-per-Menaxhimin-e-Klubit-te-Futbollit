import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManchesterUnitedHome.css";
import Navbar from "../Components/NavBar";

const TICKER_ITEMS = [
  "Man United  2 – 1  Arsenal · Premier League",
  "Transferim: Rashford kthehet në formë",
  "Ndeshja e ardhshme: Chelsea · E Shtunë 20:00",
  "Tabela: United  3. vend me 58 pikë",
  "Goli i javës: Bruno Fernandes vs Tottenham",
];

const PARTNERS = [
  { name: "Adidas",     logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
  { name: "TeamViewer", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/TeamViewer-Logo.svg" },
  { name: "Tezos",      logo: "https://cryptologos.cc/logos/tezos-xtz-logo.svg" },
  { name: "DXC",        logo: null },
  { name: "Kohler",     logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Kohler_Logo.svg" },
  { name: "Qualcomm",   logo: null },
  { name: "Cadbury",    logo: null },
  { name: "Apollo",     logo: null },
];

const FEATURES = [
  { icon: "bi-trophy-fill",     title: "20 Tituj Kampioni",        desc: "Manchester United është klubi më i titulluar në Anglinë, me 20 tituj të Ligës Premier." },
  { icon: "bi-people-fill",     title: "Akademia e Futbollit",     desc: "Nxisim talentin rinor përmes programeve të zhvillimit dhe trajnimit profesional." },
  { icon: "bi-flag-fill",       title: "Kampet e Trajnimit",       desc: "Kampe intensive trajnimi me metodologji bashkëkohore dhe staf të specializuar." },
];

export default function ManchesterUnitedHome() {
  const navigate = useNavigate();
  const [tickerOffset, setTickerOffset] = useState(0);
  const animRef   = useRef(null);
  const offsetRef = useRef(0);
  const tickerRef = useRef(null);

  const [activeSeason, setActiveSeason] = useState(null);
  const [players,  setPlayers]  = useState([]);
  const [lajme,    setLajme]    = useState([]);
  const [matches,  setMatches]  = useState([]);
  const [products, setProducts] = useState([]);
  const [email,    setEmail]    = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) navigate("/login");
  }, []);

  useEffect(() => {
    fetch("http://localhost:5001/api/seasons/active")
      .then(r => r.json()).then(d => { if (d?.emertimi) setActiveSeason(d); }).catch(() => {});
    fetch("http://localhost:5001/api/players")
      .then(r => r.json()).then(d => setPlayers(Array.isArray(d) ? d.slice(0, 6) : [])).catch(() => {});
    fetch("http://localhost:5001/api/lajme")
      .then(r => r.json()).then(d => setLajme(Array.isArray(d) ? d.slice(0, 3) : [])).catch(() => {});
    fetch("http://localhost:5001/api/ndeshjet")
      .then(r => r.json()).then(d => setMatches(Array.isArray(d) ? d.slice(0, 3) : [])).catch(() => {});
    fetch("http://localhost:5001/store")
      .then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d.slice(0, 3) : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    const totalWidth = el.scrollWidth / 2;
    let last = null;
    const step = (ts) => {
      if (last !== null) {
        offsetRef.current += (ts - last) * 0.04;
        if (offsetRef.current >= totalWidth) offsetRef.current = 0;
        setTickerOffset(Math.round(offsetRef.current));
      }
      last = ts;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  const getResult = (m) => {
    if (m.statusi !== "Luajtur") return null;
    const h = Number(m.rezultati_shtepia ?? 0), a = Number(m.rezultati_jashte ?? 0);
    return h > a ? "W" : h === a ? "D" : "L";
  };
  const RC = { W: "#22c55e", D: "#f59e0b", L: "#ef4444" };

  const SL = {
    section: { fontFamily: "'Barlow', sans-serif" },
    label:   { fontSize: 11, fontWeight: 700, letterSpacing: 4, color: "#cc0000", textTransform: "uppercase", marginBottom: 10, display: "block" },
    h2dark:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,4vw,52px)", color: "#1a1a1a", letterSpacing: 2, lineHeight: 1, marginBottom: 16 },
    h2light: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,4vw,52px)", color: "#fff", letterSpacing: 2, lineHeight: 1, marginBottom: 16 },
    btnRed:  { background: "#cc0000", border: "none", color: "#fff", padding: "12px 28px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s" },
    btnOut:  { background: "transparent", border: "1.5px solid #cc0000", color: "#cc0000", padding: "12px 28px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" },
  };

  return (
    <div className="mu-wrap">
      <Navbar />

      {/* ══ 1. HERO — stadium background ══ */}
      <div className="mu-hero" style={{ minHeight: 580 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/homepage.jpg')", backgroundSize: "cover", backgroundPosition: "center 30%", filter: "brightness(0.35)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)" }} />

        <div className="mu-hero-content" style={{ position: "relative", zIndex: 5, padding: "80px 60px", maxWidth: 680, textAlign: "left" }}>
          <div className="mu-eyebrow">
            <span className="mu-eyebrow-badge">{activeSeason ? `Sezoni ${activeSeason.emertimi}` : "Sezoni 2025/26"}</span>
            <span className="mu-eyebrow-sub">Old Trafford · Manchester</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,8vw,96px)", lineHeight: 0.92, letterSpacing: 2, color: "#fff", marginBottom: 20 }}>
            NJË FILLIM<br /><span style={{ color: "#cc0000" }}>I RI</span><br />NË FUTBOLL
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            Mirë se vini në platformën zyrtare të Manchester United FC. Ndiqni ndeshjet, blini biletat dhe qëndroni të lidhur me klubin.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button style={{ ...SL.btnRed, padding: "14px 32px", fontSize: 13 }}
              onClick={() => navigate("/ndeshjet")}
              onMouseEnter={e => e.currentTarget.style.background = "#aa0000"}
              onMouseLeave={e => e.currentTarget.style.background = "#cc0000"}>
              Shiko Ndeshjet
            </button>
            <button style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", padding: "14px 32px", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", backdropFilter: "blur(4px)" }}
              onClick={() => navigate("/lajmet")}>
              Lajmet e Fundit
            </button>
          </div>
        </div>
      </div>

      {/* ══ TICKER ══ */}
      <div style={{ background: "#cc0000", padding: "10px 0", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <span style={{ background: "#fff", color: "#cc0000", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 18px", whiteSpace: "nowrap", margin: "0 20px", flexShrink: 0 }}>LAJMET</span>
        <div ref={tickerRef} style={{ display: "flex", gap: 60, whiteSpace: "nowrap", transform: `translateX(-${tickerOffset}px)` }}>
          {doubled.map((item, i) => <span key={i} style={{ fontSize: 12, color: "#fff", fontWeight: 600, letterSpacing: 0.5 }}>{item}</span>)}
        </div>
      </div>

      <div style={SL.section}>

        {/* ══ 2. FEATURES — light bg, 3 ikona ══ */}
        <section style={{ background: "#f8f8f8", padding: "72px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
            <span style={SL.label}>Manchester United FC</span>
            <h2 style={SL.h2dark}>Programet e Akademisë</h2>
            <p style={{ fontSize: 14, color: "#888", maxWidth: 520, margin: "0 auto 56px", lineHeight: 1.8 }}>
              Ndërtuar mbi traditën e fitores dhe zhvillimit — ne ofrojmë programet më të mira të futbollit.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ background: "#fff", padding: "40px 32px", boxShadow: "0 2px 20px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(204,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 20px rgba(0,0,0,0.06)"; }}>
                  <div style={{ width: 60, height: 60, background: "#cc0000", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                    <i className={`bi ${f.icon}`} style={{ fontSize: 22, color: "#fff" }} />
                  </div>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#1a1a1a", letterSpacing: 1, marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 3. COMMUNITY — "Bëhu pjesë" + 3 karta ══ */}
        <section style={{ background: "#fff", padding: "72px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={SL.label}>Bashkohuni me ne</span>
              <h2 style={{ ...SL.h2dark, fontSize: "clamp(28px,4vw,46px)" }}>
                Bëhu Pjesë e Komunitetit<br />
                <span style={{ color: "#cc0000" }}>të Tifozëve</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>

              {/* Lajmet */}
              {lajme.slice(0, 1).map(l => (
                <div key={l.id} onClick={() => navigate("/lajmet")} style={{ cursor: "pointer", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", transition: "transform 0.25s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ height: 200, overflow: "hidden", position: "relative", background: "#eee" }}>
                    {l.foto
                      ? <img src={l.foto} alt={l.titulli} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#cc0000,#6b0000)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" alt="" style={{ height: 60, opacity: 0.3 }} />
                        </div>}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#cc0000", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "6px 14px", textTransform: "uppercase" }}>Lajm i fundit</div>
                  </div>
                  <div style={{ background: "#fff", padding: "20px 22px 24px" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4, marginBottom: 8 }}>{l.titulli}</h3>
                    <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6, marginBottom: 14 }}>{l.pershkrimi?.slice(0, 80)}...</p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#cc0000", letterSpacing: 1, textTransform: "uppercase" }}>Lexo më shumë →</span>
                  </div>
                </div>
              ))}

              {/* Ndeshjet */}
              {matches.slice(0, 1).map(m => (
                <div key={m.id} onClick={() => navigate("/ndeshjet")} style={{ cursor: "pointer", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", transition: "transform 0.25s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ height: 200, background: "linear-gradient(135deg,#1a0000,#cc0000)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "6px 14px", textTransform: "uppercase" }}>
                      {m.statusi === "Luajtur" ? "Rezultat" : "Ndeshja e radhës"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
                      <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" alt="MU" style={{ height: 44 }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#fff", letterSpacing: 4 }}>
                          {m.statusi === "Luajtur" ? `${m.rezultati_shtepia ?? 0} – ${m.rezultati_jashte ?? 0}` : "VS"}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 2 }}>{new Date(m.data_ndeshjes).toLocaleDateString("sq-AL",{day:"numeric",month:"short"})}</div>
                      </div>
                      {m.logo_kundershtarit
                        ? <img src={m.logo_kundershtarit} alt="" style={{ height: 44, objectFit: "contain" }} onError={e => e.target.style.display="none"} />
                        : <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#fff" }}>{m.ekipi_kundershtare?.slice(0,2)}</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.ekipi_kundershtare}</div>
                  </div>
                  <div style={{ background: "#fff", padding: "18px 22px 22px" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>Man United vs {m.ekipi_kundershtare}</h3>
                    <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>{m.lloji_kompeticionit || "Premier League"} · {m.stadiumi || "Old Trafford"}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#cc0000", letterSpacing: 1, textTransform: "uppercase" }}>Shiko Detajet →</span>
                  </div>
                </div>
              ))}

              {/* Store */}
              {products.slice(0, 1).map(pr => (
                <div key={pr.id} onClick={() => navigate("/Store")} style={{ cursor: "pointer", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", transition: "transform 0.25s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ height: 200, overflow: "hidden", background: "#f0f0f0", position: "relative" }}>
                    {pr.imageUrl
                      ? <img src={pr.imageUrl} alt={pr.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                      : <div style={{ width: "100%", height: "100%", background: "#e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" alt="" style={{ height: 60, opacity: 0.15 }} />
                        </div>}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#cc0000", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "6px 14px", textTransform: "uppercase" }}>Store Zyrtare</div>
                    {pr.badge && <div style={{ position: "absolute", top: 28, right: 12, background: "#1a1a1a", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", letterSpacing: 1 }}>{pr.badge}</div>}
                  </div>
                  <div style={{ background: "#fff", padding: "20px 22px 24px" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{pr.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#cc0000" }}>€{Number(pr.price).toFixed(2)}</span>
                      {pr.oldPrice && <span style={{ fontSize: 12, color: "#ccc", textDecoration: "line-through" }}>€{Number(pr.oldPrice).toFixed(2)}</span>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#cc0000", letterSpacing: 1, textTransform: "uppercase" }}>Bli Tani →</span>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ══ 4. LOJTARËT — dark split ══ */}
        <section style={{ background: "#111", display: "flex", minHeight: 460 }}>
          {/* LEFT */}
          <div style={{ flex: "0 0 46%", padding: "64px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ ...SL.label, color: "#cc0000" }}>Skuadra 2025/26</span>
            <h2 style={{ ...SL.h2light, fontSize: "clamp(36px,5vw,60px)" }}>LOJTARËT &amp;<br />SKUADRA</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 360, marginBottom: 32 }}>
              Njihuni me lojtarët e Manchester United — talente botërore të bashkuara nën flamurin e kuq.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 32 }}>
              {players.slice(0, 4).map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #cc0000" }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "rgba(255,255,255,0.1)", width: 30 }}>{p.numri_faneles ?? "–"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.emri} {p.mbiemri}</div>
                    <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>{p.pozicioni}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={SL.btnRed} onClick={() => navigate("/players")}
              onMouseEnter={e => e.currentTarget.style.background = "#aa0000"}
              onMouseLeave={e => e.currentTarget.style.background = "#cc0000"}>
              Shiko Skuadrën →
            </button>
          </div>
          {/* RIGHT — imazh */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img src="/homepage.jpg" alt="Lojtarët" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.5) saturate(0.8)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #111 0%, transparent 30%)" }} />
            {/* Stats overlay */}
            <div style={{ position: "absolute", bottom: 32, right: 32, display: "flex", gap: 16 }}>
              {[{n: players.length || "–", l:"Lojtarë"},{n:"20×",l:"Tituj"},{n:"3×",l:"CL"}].map(s => (
                <div key={s.l} style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: "16px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#cc0000", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 5. PARTNERËT — logos ══ */}
        <section style={{ background: "#fff", padding: "64px 40px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
            <span style={SL.label}>Bashkëpunëtorët</span>
            <h2 style={{ ...SL.h2dark, marginBottom: 48 }}>PARTNERËT ZYRTARË</h2>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
              {PARTNERS.map(p => (
                <div key={p.name} style={{ width: 110, height: 110, borderRadius: "50%", border: "2px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "#fafafa", transition: "all 0.25s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.border = "2px solid #cc0000"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(204,0,0,0.15)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.border = "2px solid #eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {p.logo
                    ? <img src={p.logo} alt={p.name} style={{ maxWidth: 56, maxHeight: 32, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                    : <i className="bi bi-building" style={{ fontSize: 24, color: "#ccc" }} />}
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#aaa", letterSpacing: 1.5, textTransform: "uppercase" }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 6. NEWSLETTER ══ */}
        <section style={{ background: "#0a0a0a", padding: "80px 40px", textAlign: "center" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <span style={SL.label}>Qëndro i informuar</span>
            <h2 style={{ ...SL.h2light, marginBottom: 14 }}>NEWSLETTER</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginBottom: 40 }}>
              Regjistrohu dhe merr lajmet, ofertat dhe njoftime ekskluzive drejtpërdrejt në inbox-in tuaj.
            </p>
            {subscribed
              ? <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", padding: "16px 24px", color: "#4ade80", fontSize: 14, fontWeight: 600 }}>
                  ✓ U regjistruat me sukses!
                </div>
              : <div style={{ display: "flex" }}>
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && email.includes("@") && setSubscribed(true)}
                    placeholder="Email-i juaj..."
                    style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRight: "none", color: "#fff", fontSize: 13, padding: "14px 20px", fontFamily: "'Barlow',sans-serif", outline: "none" }} />
                  <button onClick={() => email.includes("@") && setSubscribed(true)}
                    style={{ background: "#cc0000", border: "none", color: "#fff", padding: "14px 24px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#aa0000"}
                    onMouseLeave={e => e.currentTarget.style.background = "#cc0000"}>
                    Regjistrohu
                  </button>
                </div>
            }
          </div>
        </section>

      </div>
    </div>
  );
}
