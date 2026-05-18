import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Modal, Form, Row, Col } from "react-bootstrap";

import "./Dashboard.css";


const API = "http://localhost:5001/api/ndeshjet";

const NAV_LINKS = ["Lajmet", "Ndeshjet", "Lojtarët", "Tablela", "Shop"];

const navLinks = [
  { section: "Kryesor",   items: [{ label: "Dashboard",    path: "/dashboard" }] },
  { section: "Menaxhim",  items: [{ label: "Lojtarët",     path: "/players",            badge: 6 },
                                   { label: "Store", path: "/Store", badge: 18 },
                                   { label: "Stafi",        path: "/staff",              badge: 4 },
                                   { label: "Ndeshjet",     path: "/dashboardNdeshjet",  badge: 5 },
                                   { label: "Stërvitjet",   path: "/training",           badge: 4 }] },
  { section: "Financa",   items: [{ label: "Transferimet", path: "/transfers", badge: 3 },
                                   { label: "Kontratat",    path: "/contracts", badge: 4 }] },
  { section: "Analitikë", items: [{ label: "Dëmtimet",     path: "/injuries", badge: 4 },
                                   { label: "Sezonet",      path: "/seasons",  badge: 3 },
                                   { label: "Klubet",       path: "/clubs",    badge: 3 }] },
];

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

const COMP_SHORT = {
  Ligë: "PL",
  Kupë: "FA",
  Miqësore: "FR",
  Europiane: "UCL",
};

const emptyForm = {
  club_id: 1,
  ekipi_kundershtare: "",
  data_ndeshjes: "",
  ora: "20:00",
  stadiumi: "",
  lloji_kompeticionit: "Ligë",
  rezultati_shtepia: 0,
  rezultati_jashte: 0,
  statusi: "Planifikuar",
  season_id: null,
};

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
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
  return (
    <div className="nd-logo">
      {src ? (
        <img
          src={src}
          alt={name}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

/* ── Match Row (identik me Ndeshjet.jsx + CRUD buttons) ── */
function MatchRow({ match, onBuyTicket, onEdit, onDelete }) {
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
        <div className="nd-team-home">
          <span
            className={`nd-team-name ${match.home === "Man United" ? "mu" : ""}`}
          >
            {match.home}
          </span>
          <TeamLogo name={match.home} />
        </div>

        <div
          className={`nd-score ${isUpcoming ? "upcoming" : `result ${resultClass}`}`}
        >
          {match.score}
        </div>

        <div className="nd-team-away">
          <TeamLogo name={match.away} />
          <span
            className={`nd-team-name ${match.away === "Man United" ? "mu" : ""}`}
          >
            {match.away}
          </span>
        </div>
      </div>

      <div className="nd-venue">{match.venue}</div>

      {isUpcoming && (
        <div className="nd-ticket-action">
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

      {/* ── CRUD Buttons (shtuar) ── */}
      <div className="nd-crud-actions">
        <button
          className="nd-crud-btn nd-crud-edit"
          onClick={() => onEdit(match)}
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button
          className="nd-crud-btn nd-crud-delete"
          onClick={() => onDelete(match.id)}
          title="Fshi"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Fshi
        </button>
      </div>
    </div>
  );
}

/* ── Stats Bar ── */
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

/* ════════════════════════════════════════════════════════════ */
export default function DashboardNdeshjet() {
  const [tab, setTab] = useState("rezultate");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ── CRUD State ── */
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [msg, setMsg] = useState("");

  /* ── Data from API ── */
  const [apiMatches, setApiMatches] = useState([]);

  useEffect(() => {
    if (searchParams.get("tab") === "fixtures") {
      setTab("fixtures");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(API);
      setApiMatches(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  /* ── Convert API matches to same format as Ndeshjet.jsx ── */
  const dayNames = ["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"];
  const monthNames = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];

  const convertApiMatch = (m) => {
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
      score: isPlayed ? `${h} – ${a}` : (m.ora ? String(m.ora).slice(0, 5) : "TBD"),
      result,
      venue: m.stadiumi || "",
      ticketsAvailable: !isPlayed,
      _raw: m,
    };
  };

  const groupByMonth = (list) => {
    const groups = {};
    list.forEach((m) => {
      const raw = m._raw;
      const d = raw?.data_ndeshjes ? new Date(raw.data_ndeshjes) : null;
      const key = d ? `${monthNames[d.getMonth()]} ${d.getFullYear()}` : "Pa datë";
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups).map(([month, matches]) => ({ month, matches }));
  };

  const apiConverted = apiMatches.map(convertApiMatch);
  const apiResults = apiConverted.filter((m) => m.result !== "upcoming");
  const apiFixtures = apiConverted.filter((m) => m.result === "upcoming");
  const data = tab === "rezultate" ? groupByMonth(apiResults) : groupByMonth(apiFixtures);

  /* ── CRUD handlers ── */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShow(true);
  };

  const openEdit = (match) => {
    const raw = match._raw;
    if (raw) {
      setEditId(raw.id);
      setForm({
        club_id: raw.club_id || 1,
        ekipi_kundershtare: raw.ekipi_kundershtare || "",
        data_ndeshjes: raw.data_ndeshjes?.split("T")[0] || "",
        ora: raw.ora ? String(raw.ora).slice(0, 5) : "",
        stadiumi: raw.stadiumi || "",
        lloji_kompeticionit: raw.lloji_kompeticionit || "Ligë",
        rezultati_shtepia: raw.rezultati_shtepia ?? 0,
        rezultati_jashte: raw.rezultati_jashte ?? 0,
        statusi: raw.statusi || "Planifikuar",
        season_id: raw.season_id || null,
      });
    } else {
      setEditId(match.id);
      setForm({
        ...emptyForm,
        ekipi_kundershtare: match.away === "Man United" ? match.home : match.away,
        stadiumi: match.venue,
      });
    }
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        club_id: Number(form.club_id),
        ekipi_kundershtare: form.ekipi_kundershtare,
        data_ndeshjes: form.data_ndeshjes,
        ora: form.ora || null,
        stadiumi: form.stadiumi || null,
        lloji_kompeticionit: form.lloji_kompeticionit,
        rezultati_shtepia: form.statusi === "Luajtur" ? Number(form.rezultati_shtepia) : null,
        rezultati_jashte: form.statusi === "Luajtur" ? Number(form.rezultati_jashte) : null,
        statusi: form.statusi,
        season_id: form.season_id || null,
      };
      if (editId) await axios.put(`${API}/${editId}`, payload);
      else await axios.post(API, payload);
      setShow(false);
      fetchMatches();
      setMsg(editId ? "Ndeshja u ndryshua me sukses!" : "Ndeshja u shtua me sukses!");
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish këtë ndeshje?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchMatches();
      setMsg("Ndeshja u fshi me sukses!");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="shell">

      {/* ===== SIDEBAR (si Dashboard.jsx) ===== */}
      <aside className="sidebar">
        <div className="logo-area">
          <div className="crest">MU</div>
          <div className="club-name">Manchester<span>United FC</span></div>
        </div>
        <nav className="flex-grow-1 overflow-auto py-2">
          {navLinks.map((group) => (
            <React.Fragment key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map((item) => (
                <div
                  key={item.path}
                  className={`nav-item${item.path === "/dashboardNdeshjet" ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="nav-dot" />
                  {item.label}
                  {item.badge && (
                    <span className="badge ms-auto" style={{ background: "#DA291C" }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="badge fw-bold" style={{ background: "#FBE122", color: "#000" }}>2025/26</span>
          <span style={{ fontSize: 11, color: "#888" }}>Premier League</span>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="main">

        {/* ── Topbar (si Dashboard.jsx) ── */}
        <div className="topbar">
          <div className="topbar-title">Menaxhimi i Ndeshjeve</div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-mu" onClick={openAdd}>+ Shto Ndeshje</button>
            <div className="avatar">{user?.emri?.[0] || "A"}{user?.mbiemri?.[0] || "K"}</div>
          </div>
        </div>

        <div className="content" style={{ padding: 0 }}>

          {/* ── Hero — identik me Ndeshjet.jsx ── */}
          <div
            className="mu-hero"
            style={{ minHeight: 220, alignItems: "flex-end" }}
          >
            <div className="mu-hero-bg" />
            <div className="mu-hero-stripe" />
            <div className="mu-hero-content" style={{ padding: "36px 50px 28px" }}>
              <div className="mu-eyebrow">
                <span className="mu-eyebrow-badge">Sezoni 2025/26</span>
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

          {/* ── Alert mesazh ── */}
          {msg && (
            <div
              style={{
                background: "rgba(34,197,94,0.15)",
                border: "1px solid #22c55e",
                color: "#22c55e",
                borderRadius: 0,
                padding: "12px 50px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{msg}</span>
              <button
                onClick={() => setMsg("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#22c55e",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Tabs — identik me Ndeshjet.jsx ── */}
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

          {/* ── Match list — identik me Ndeshjet.jsx + CRUD buttons ── */}
          <div className="nd-list">
            {tab === "rezultate" && <StatsBar matches={data} />}

            {data.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
                Nuk ka ndeshje. Shtyp "+ Shto Ndeshje" për të shtuar.
              </div>
            )}

            {data.map((group) => (
              <div key={group.month}>
                <div className="nd-month">{group.month}</div>
                {group.matches.map((match, i) => (
                  <MatchRow
                    key={match.id || i}
                    match={match}
                    onBuyTicket={(id) => navigate(`/SectorPage/${id}`)}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* ── Ticker — identik me Ndeshjet.jsx ── */}
          <div className="mu-ticker">
            <span className="mu-ticker-label">Live</span>
            <div
              className="mu-ticker-track"
              style={{ animation: "ndeshjetTicker 30s linear infinite" }}
            >
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="mu-ticker-item">
                  {item}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ===== MODAL — Add / Edit ===== */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        size="lg"
        className="staff-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Ndrysho Ndeshjen" : "Shto Ndeshje të Re"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label>Ekipi Kundërshtar</Form.Label>
                <Form.Control
                  name="ekipi_kundershtare"
                  value={form.ekipi_kundershtare}
                  onChange={handleChange}
                  required
                  placeholder="p.sh. Arsenal"
                />
              </Col>
              <Col md={6}>
                <Form.Label>Data e Ndeshjes</Form.Label>
                <Form.Control
                  type="date"
                  name="data_ndeshjes"
                  value={form.data_ndeshjes}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Ora</Form.Label>
                <Form.Control
                  type="time"
                  name="ora"
                  value={form.ora}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Stadiumi</Form.Label>
                <Form.Control
                  name="stadiumi"
                  value={form.stadiumi}
                  onChange={handleChange}
                  placeholder="p.sh. Old Trafford"
                />
              </Col>
              <Col md={6}>
                <Form.Label>Lloji i Kompeticionit</Form.Label>
                <Form.Select
                  name="lloji_kompeticionit"
                  value={form.lloji_kompeticionit}
                  onChange={handleChange}
                  required
                >
                  <option value="Ligë">Ligë</option>
                  <option value="Kupë">Kupë</option>
                  <option value="Miqësore">Miqësore</option>
                  <option value="Europiane">Europiane</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Rezultati Home</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="rezultati_shtepia"
                  value={form.rezultati_shtepia}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Rezultati Away</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="rezultati_jashte"
                  value={form.rezultati_jashte}
                  onChange={handleChange}
                />
              </Col>
              <Col md={12}>
                <Form.Label>Statusi</Form.Label>
                <Form.Select
                  name="statusi"
                  value={form.statusi}
                  onChange={handleChange}
                >
                  <option value="Planifikuar">Planifikuar</option>
                  <option value="Luajtur">Luajtur</option>
                  <option value="Anuluar">Anuluar</option>
                  <option value="Shtyrë">Shtyrë</option>
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <button
              type="button"
              className="btn btn-delete"
              onClick={() => setShow(false)}
            >
              Anulo
            </button>
            <button type="submit" className="btn btn-mu">
              {editId ? "Ruaj Ndryshimet" : "Shto Ndeshjen"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
