import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";
import "./ManchesterUnitedHome.css";
import "./Ndeshjet.css";
import Navbar from "../Components/NavBar";

const API = "/api/ndeshjet";

const LOGOS = {
  "Man United":
    "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  Arsenal: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  Chelsea: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  Liverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  Tottenham:
    "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  PSG: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
};

const RESULT_COLOR_CLASS = {
  win: "win",
  loss: "loss",
  draw: "draw",
  upcoming: "upcoming",
};


/* ── Team Logo ── */
function TeamLogo({ name, logoUrl }) {
  const src = logoUrl || LOGOS[name];
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 3);
  return (
    <div className="nd-logo">
      {src ? (
        <img src={src} alt={name} onError={(e) => { e.target.style.display = "none"; }} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

/* ── Match Row ── */
function MatchRow({ match, onBuyTicket, onShowLineup }) {
  const isUpcoming = match.result === "upcoming";
  const resultClass = RESULT_COLOR_CLASS[match.result];
  const awayLogo = match.home === "Man United" ? match.logo_kundershtarit : null;
  const homeLogo = match.away === "Man United" ? match.logo_kundershtarit : null;

  return (
    <div className={`nd-match ${resultClass}`}>
      {/* Date */}
      <div className="nd-date">
        <div className="nd-date-day">{match.day}</div>
        <div className="nd-date-num">{match.date}</div>
        {match.time && <div className="nd-date-ko">KO {match.time}</div>}
      </div>

      {/* Competition */}
      <div className="nd-comp">
        <span className={`nd-comp-badge ${match.comp}`}>{match.comp}</span>
      </div>

      {/* Teams + Score */}
      <div className="nd-teams">
  
        <div className="nd-team-home">
          <span
            className={`nd-team-name ${match.home === "Man United" ? "mu" : ""}`}
          >
            {match.home}
          </span>
          <TeamLogo name={match.home} logoUrl={homeLogo} />
        </div>

        {/* Score */}
        <div
          className={`nd-score ${isUpcoming ? "upcoming" : `result ${resultClass}`}`}
        >
          {match.score}
        </div>

  
        <div className="nd-team-away">
          <TeamLogo name={match.away} logoUrl={awayLogo} />
          <span
            className={`nd-team-name ${match.away === "Man United" ? "mu" : ""}`}
          >
            {match.away}
          </span>
        </div>
      </div>


      <div className="nd-venue">{match.venue}</div>

      {isUpcoming && (
        <div className="nd-ticket-action" style={{ flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <button
            onClick={() => onShowLineup(match)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
              padding: 0,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            📋 Formacioni
          </button>
          {match.ticketsAvailable ? (
            <button
              className="nd-buy-btn"
              onClick={() => onBuyTicket(match.id)}
            >
              Bli Biletën →
            </button>
          ) : (
            <span className="nd-sold-out">Të shitura</span>
          )}
        </div>
      )}
    </div>
  );
}

function StatsBar({ matches }) {
  const all = matches.flatMap((g) => g.matches);
  const stats = [
    {
      val: all.filter((m) => m.result === "win").length,
      label: "Fituar",
      color: "#22c55e",
    },
    {
      val: all.filter((m) => m.result === "draw").length,
      label: "Barazim",
      color: "#eab308",
    },
    {
      val: all.filter((m) => m.result === "loss").length,
      label: "Humbur",
      color: "#ef4444",
    },
    { val: all.length, label: "Totali", color: "#fff" },
  ];

  return (
    <div className="nd-stats">
      {stats.map(({ val, label, color }) => (
        <div key={label} className="nd-stat-item">
          <div className="nd-stat-val" style={{ color }}>
            {val}
          </div>
          <div className="nd-stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

const dayNames = ["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"];
const monthNames = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];

const COMP_SHORT = { Ligë: "PL", Kupë: "FA", Miqësore: "FR", Europiane: "UCL" };

function convertApiMatch(m) {
  const dateObj = m.data_ndeshjes ? new Date(m.data_ndeshjes) : null;
  const isPlayed = m.statusi === "Luajtur";
  const h = Number(m.rezultati_shtepia ?? 0);
  const a = Number(m.rezultati_jashte ?? 0);
  let result = "upcoming";
  if (isPlayed) {
    if (h > a) result = "win";
    else if (h < a) result = "loss";
    else result = "draw";
  }
  return {
    id: m.id,
    day: dateObj ? dayNames[dateObj.getDay()] : "",
    date: dateObj ? `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}` : "",
    comp: COMP_SHORT[m.lloji_kompeticionit] || "PL",
    home: "Man United",
    away: m.ekipi_kundershtare,
    logo_kundershtarit: m.logo_kundershtarit || null,
    score: isPlayed ? `${h} – ${a}` : "VS",
    time: !isPlayed ? (() => {
      if (!m.ora) return null;
      const s = String(m.ora);
      if (s.includes("T")) {
        const d = new Date(m.ora);
        return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
      }
      return s.slice(0, 5);
    })() : null,
    result,
    venue: m.stadiumi || "",
    ticketsAvailable: !isPlayed,
    _raw: m,
  };
}

function groupByMonth(list) {
  const groups = {};
  list.forEach((m) => {
    const raw = m._raw;
    const d = raw?.data_ndeshjes ? new Date(raw.data_ndeshjes) : null;
    const key = d ? `${monthNames[d.getMonth()]} ${d.getFullYear()}` : "Pa datë";
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return Object.entries(groups).map(([month, matches]) => ({ month, matches }));
}

export default function Ndeshjet() {
  const [tab, setTab] = useState("rezultate");
  const [apiMatches, setApiMatches] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tab") === "fixtures") setTab("fixtures");
  }, [searchParams]);

  useEffect(() => {
    api.get(API)
      .then(res => setApiMatches(res.data))
      .catch(err => console.error(err));
    api.get("/api/seasons/active").then(r => { if (r.data?.emertimi) setActiveSeason(r.data); }).catch(() => {});
  }, []);

  const converted = apiMatches.map(convertApiMatch);
  const results  = converted.filter(m => m.result !== "upcoming");
  const fixtures = converted.filter(m => m.result === "upcoming");
  const data = tab === "rezultate" ? groupByMonth(results) : groupByMonth(fixtures);

  return (
    <div className="mu-wrap">
      <Navbar />


      <div
        className="mu-hero"
        style={{ minHeight: 220, alignItems: "flex-end" }}
      >
        <div className="mu-hero-bg" />
        <div className="mu-hero-stripe" />
        <div className="mu-hero-content" style={{ padding: "36px 50px 28px" }}>
          <div className="mu-eyebrow">
            <span className="mu-eyebrow-badge">{activeSeason ? `Sezoni ${activeSeason.emertimi}` : "Sezoni 2025/26"}</span>
            <span className="mu-eyebrow-sub">All Competitions</span>
          </div>
          <h1
            className="mu-title"
            style={{ fontSize: "clamp(52px, 7vw, 78px)" }}
          >
            NDESHJET
          </h1>
        </div>
      </div>

      {/* Tabs — nga Ndeshjet.css */}
      <div className="nd-tabs">
        {[
          { key: "rezultate", label: "Rezultate" },
          { key: "fixtures", label: "Ndeshjet e ardhshme" },
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


      <div className="nd-list">
        {tab === "rezultate" && <StatsBar matches={data} />}
        {data.map((group) => (
          <div key={group.month}>
            <div className="nd-month">{group.month}</div>
            {group.matches.map((match, i) => (
              <MatchRow
                key={i}
                match={match}
                onBuyTicket={(id) => navigate(`/SectorPage/${id}`)}
                onShowLineup={(m) => navigate(`/lineup/${m.id}`)}
              />
            ))}
          </div>
        ))}
      </div>


    </div>
  );
}
