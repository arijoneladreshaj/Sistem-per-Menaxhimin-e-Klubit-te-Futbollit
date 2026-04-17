import { useState, useRef, useEffect } from "react";
import "./ManchesterUnitedHome.css";

const NAV_LINKS = ["Lajmet", "Ndeshjet", "Lojtarët", "Tablela", "Shop"];

const TICKER_ITEMS = [
  "Man United  2 – 1  Arsenal · Premier League",
  "Transferim: Rashford kthehet në formë",
  "Ndeshja e ardhshme: Chelsea · E Shtunë 20:00",
  "Tabela: United  3. vend me 58 pikë",
  "Goli i javës: Bruno Fernandes vs Tottenham",
];


export default function ManchesterUnitedHome() {
  const [tickerOffset, setTickerOffset] = useState(0);
  const animRef = useRef(null);
  const offsetRef = useRef(0);
  const tickerRef = useRef(null);

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

  return (
    <div className="mu-wrap">

      <nav className="mu-nav">
        <div className="mu-nav-left">
          <div className="mu-logo">
           <img 
  src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" 
  alt="MUFC" 
  style={{ height: "40px" }} 
/>
            <span className="mu-logo-name">Manchester United</span>
          </div>
          <ul className="mu-nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mu-nav-right">
          <button className="mu-btn-solid">Bli Bileta</button>
        </div>
      </nav>

      <div className="mu-hero">
        <div className="mu-hero-bg" />
        <div className="mu-hero-stripe" />

       <div className="mu-player-area">
  <img src="/homepage.jpg" alt="Lojtari" className="mu-player-img" />
</div>
        <div className="mu-player-fade" />

        <div className="mu-hero-content">
          <div className="mu-eyebrow">
            <span className="mu-eyebrow-badge">Sezoni 2025/26</span>
            <span className="mu-eyebrow-sub">Old Trafford</span>
          </div>

          <h1 className="mu-title">
            GLORY<br />
            GLORY<br />
            <span className="mu-title-muted">MAN UTD</span>
          </h1>

          <p className="mu-subtitle">
            Mirë se vini në faqen zyrtare të Manchester United.
            Ndiqni lajmet, ndeshjet dhe lojtarët tuaj të preferuar.
          </p>

          <div className="mu-actions">
            <button className="mu-cta-main">Shiko Ndeshjet</button>
            <button className="mu-cta-sec">Lajmet e Fundit</button>
          </div>
        </div>

      

      </div>

      <div className="mu-ticker">
        <span className="mu-ticker-label">Live</span>
        <div
          ref={tickerRef}
          className="mu-ticker-track"
          style={{ transform: `translateX(-${tickerOffset}px)` }}
        >
          {doubled.map((item, i) => (
            <span key={i} className="mu-ticker-item">{item}</span>
          ))}
        </div>
      </div>

    </div>
  );
}