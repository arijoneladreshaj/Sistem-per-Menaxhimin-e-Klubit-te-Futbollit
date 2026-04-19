import { useState } from "react";
import { Link } from "react-router-dom";
import "./ManchesterUnitedHome.css";
import "./Ndeshjet.css";

const NAV_LINKS = ["Lajmet", "Ndeshjet", "Lojtarët", "Tablela", "Shop"];

const LOGOS = {
  "Man United": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  Arsenal:      "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  Chelsea:      "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  Liverpool:    "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  Tottenham:    "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  PSG:          "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
};

const RESULT_COLOR_CLASS = {
  win:      "win",
  loss:     "loss",
  draw:     "draw",
  upcoming: "upcoming",
};

const RESULTS = [
  {
    month: "Prill 2026",
    matches: [
      { day: "E Shtunë",  date: "12 Prill",  comp: "PL",  home: "Man United",  away: "Tottenham",  score: "3 – 1", result: "win",      venue: "Old Trafford"     },
      { day: "E Martë",   date: "8 Prill",   comp: "UCL", home: "Man United",  away: "PSG",        score: "1 – 1", result: "draw",     venue: "Old Trafford"     },
      { day: "E Shtunë",  date: "5 Prill",   comp: "PL",  home: "Bournemouth", away: "Man United", score: "0 – 2", result: "win",      venue: "Vitality"         },
    ],
  },
  {
    month: "Mars 2026",
    matches: [
      { day: "E Martë",  date: "18 Mars", comp: "UCL", home: "PSG",        away: "Man United", score: "2 – 1", result: "loss",  venue: "Parc des Princes" },
      { day: "E Shtunë", date: "15 Mars", comp: "PL",  home: "Man United", away: "Arsenal",    score: "2 – 1", result: "win",   venue: "Old Trafford"     },
      { day: "E Diel",   date: "9 Mars",  comp: "FA",  home: "Man United", away: "Leicester",  score: "4 – 0", result: "win",   venue: "Old Trafford"     },
      { day: "E Shtunë", date: "1 Mars",  comp: "PL",  home: "Chelsea",    away: "Man United", score: "2 – 2", result: "draw",  venue: "Stamford Bridge"  },
    ],
  },
  {
    month: "Shkurt 2026",
    matches: [
      { day: "E Shtunë", date: "22 Shkurt", comp: "PL",  home: "Man United", away: "Liverpool", score: "1 – 3", result: "loss", venue: "Old Trafford" },
      { day: "E Martë",  date: "18 Shkurt", comp: "UCL", home: "Man United", away: "Dortmund",  score: "2 – 0", result: "win",  venue: "Old Trafford" },
      { day: "E Shtunë", date: "8 Shkurt",  comp: "PL",  home: "Man United", away: "Everton",   score: "3 – 0", result: "win",  venue: "Old Trafford" },
    ],
  },
];

const FIXTURES = [
  {
    month: "Prill 2026",
    matches: [
      { day: "E Shtunë",  date: "19 Prill", comp: "PL",  home: "Chelsea",    away: "Man United", score: "20:00", result: "upcoming", venue: "Stamford Bridge" },
      { day: "E Mërkurë", date: "23 Prill", comp: "UCL", home: "Man United", away: "PSG",        score: "21:00", result: "upcoming", venue: "Old Trafford"    },
    ],
  },
  {
    month: "Maj 2026",
    matches: [
      { day: "E Shtunë", date: "3 Maj",  comp: "PL", home: "Man United", away: "Newcastle",  score: "15:00", result: "upcoming", venue: "Old Trafford" },
      { day: "E Shtunë", date: "10 Maj", comp: "PL", home: "Wolves",     away: "Man United", score: "15:00", result: "upcoming", venue: "Molineux"     },
      { day: "E Diel",   date: "18 Maj", comp: "PL", home: "Man United", away: "Aston Villa",score: "16:00", result: "upcoming", venue: "Old Trafford" },
      { day: "E Diel",   date: "25 Maj", comp: "PL", home: "Brighton",   away: "Man United", score: "16:00", result: "upcoming", venue: "Falmer"       },
    ],
  },
];

const TICKER_ITEMS = [
  "Man United  2 – 1  Arsenal · Premier League",
  "Transferim: Rashford kthehet në formë",
  "Ndeshja e ardhshme: Chelsea · E Shtunë 20:00",
  "Tabela: United  3. vend me 58 pikë",
  "Goli i javës: Bruno Fernandes vs Tottenham",
];

/* ── Team Logo ── */
function TeamLogo({ name }) {
  const src = LOGOS[name];
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 3);
  return (
    <div className="nd-logo">
      {src
        ? <img src={src} alt={name} onError={(e) => { e.target.style.display = "none"; }} />
        : <span>{initials}</span>
      }
    </div>
  );
}

/* ── Match Row ── */
function MatchRow({ match }) {
  const isUpcoming = match.result === "upcoming";
  const resultClass = RESULT_COLOR_CLASS[match.result];

  return (
    <div className={`nd-match ${resultClass}`}>

      {/* Date */}
      <div className="nd-date">
        <div className="nd-date-day">{match.day}</div>
        <div className="nd-date-num">{match.date}</div>
      </div>

      {/* Competition */}
      <div className="nd-comp">
        <span className={`nd-comp-badge ${match.comp}`}>{match.comp}</span>
      </div>

      {/* Teams + Score */}
      <div className="nd-teams">

        {}
        <div className="nd-team-home">
          <span className={`nd-team-name ${match.home === "Man United" ? "mu" : ""}`}>
            {match.home}
          </span>
          <TeamLogo name={match.home} />
        </div>

        {/* Score */}
        <div className={`nd-score ${isUpcoming ? "upcoming" : `result ${resultClass}`}`}>
          {match.score}
        </div>

        {}
        <div className="nd-team-away">
          <TeamLogo name={match.away} />
          <span className={`nd-team-name ${match.away === "Man United" ? "mu" : ""}`}>
            {match.away}
          </span>
        </div>

      </div>

      {}
      <div className="nd-venue">{match.venue}</div>

    </div>
  );
}


function StatsBar() {
  const all = RESULTS.flatMap((g) => g.matches);
  const stats = [
    { val: all.filter((m) => m.result === "win").length,  label: "Fituar",  color: "#22c55e" },
    { val: all.filter((m) => m.result === "draw").length, label: "Barazim", color: "#eab308" },
    { val: all.filter((m) => m.result === "loss").length, label: "Humbur",  color: "#ef4444" },
    { val: all.length,                                    label: "Totali",  color: "#fff"    },
  ];

  return (
    <div className="nd-stats">
      {stats.map(({ val, label, color }) => (
        <div key={label} className="nd-stat-item">
          <div className="nd-stat-val" style={{ color }}>{val}</div>
          <div className="nd-stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}


export default function Ndeshjet() {
  const [tab, setTab] = useState("rezultate");
  const data = tab === "rezultate" ? RESULTS : FIXTURES;

  return (
    <div className="mu-wrap">

      {}
      <nav className="mu-nav">
        <div className="mu-nav-left">
          <div className="mu-logo">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
              alt="MUFC"
              style={{ height: 40 }}
            />
            <span className="mu-logo-name">Manchester United</span>
          </div>
          <ul className="mu-nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                {link === "Lajmet" ? (
                  <Link to="/">{link}</Link>
                ) : (
                  <a
                    href="#"
                    style={link === "Ndeshjet"
                      ? { color: "#fff", borderBottom: "2px solid #fff", paddingBottom: 2 }
                      : {}}
                  >
                    {link}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mu-nav-right">
            <button className="mu-btn-solid" onClick={() => navigate("/login")}>Kyçu</button>
          <button className="mu-btn-solid">Bli Bileta</button>
        </div>
      </nav>

      {}
      <div className="mu-hero" style={{ minHeight: 220, alignItems: "flex-end" }}>
        <div className="mu-hero-bg" />
        <div className="mu-hero-stripe" />
        <div className="mu-hero-content" style={{ padding: "36px 50px 28px" }}>
          <div className="mu-eyebrow">
            <span className="mu-eyebrow-badge">Sezoni 2025/26</span>
            <span className="mu-eyebrow-sub">All Competitions</span>
          </div>
          <h1 className="mu-title" style={{ fontSize: "clamp(52px, 7vw, 78px)" }}>
            NDESHJET
          </h1>
        </div>
      </div>

      {/* Tabs — nga Ndeshjet.css */}
      <div className="nd-tabs">
        {[
          { key: "rezultate", label: "Rezultate" },
          { key: "fixtures",  label: "Ndeshjet e ardhshme" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`nd-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {}
      <div className="nd-list">
        {tab === "rezultate" && <StatsBar />}
        {data.map((group) => (
          <div key={group.month}>
            <div className="nd-month">{group.month}</div>
            {group.matches.map((match, i) => (
              <MatchRow key={i} match={match} />
            ))}
          </div>
        ))}
      </div>

      {}
      <div className="mu-ticker">
        <span className="mu-ticker-label">Live</span>
        <div
          className="mu-ticker-track"
          style={{ animation: "ndeshjetTicker 30s linear infinite" }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mu-ticker-item">{item}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
