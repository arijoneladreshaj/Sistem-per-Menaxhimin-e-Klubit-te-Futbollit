import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Components/NavBar";
import "./pages/ManchesterUnitedHome.css";

const LOCAL = (name) => `/players/${name}.png`;

// ── DB → UI mapper ────────────────────────────────────────────────────────────
const POZ_MAP = {
  Portier:   { pos: "GK",  cat: "GK"  },
  Mbrojtës:  { pos: "CB",  cat: "DEF" },
  Mesfushor: { pos: "CM",  cat: "MID" },
  Sulmues:   { pos: "ST",  cat: "FWD" },
};

function mapPlayer(p) {
  const { pos, cat } = POZ_MAP[p.pozicioni] || { pos: "CM", cat: "MID" };
  const age = p.data_lindjes
    ? Math.floor((Date.now() - new Date(p.data_lindjes)) / (1000 * 60 * 60 * 24 * 365.25))
    : null;
  const born = p.data_lindjes
    ? new Date(p.data_lindjes).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;
  return {
    id:          p.id,
    number:      p.numri_faneles ?? 0,
    name:        p.emri,
    surname:     p.mbiemri,
    pos,
    cat,
    country:     p.kombesia ?? "",
    flag:        "",
    born,
    age,
    height:      p.gjatesia ? `${p.gjatesia} cm` : null,
    weight:      p.pesha    ? `${p.pesha} kg`    : null,
    foot:        null,
    joined:      null,
    contract:    null,
    apps:        0,
    goals:       0,
    assists:     0,
    saves:       0,
    cleanSheets: 0,
    rating:      70,
    captain:     false,
    onLoan:      p.statusi === "I transferuar",
    photo:       null,
    bio:         `${p.emri} ${p.mbiemri} · ${p.pozicioni}${p.kombesia ? " · " + p.kombesia : ""}`,
    vlera:       p.vlera_tregut,
    statusi:     p.statusi,
  };
}

// ── (placeholder — do not delete) ─────────────────────────────────────────────
const _staticPlayers = [
  // GOALKEEPERS
  {
    id: 1, number: 1, name: "Altay", surname: "Bayındır",
    pos: "GK", cat: "GK", country: "Türkiye", flag: "🇹🇷",
    born: "Apr 9, 1998", age: 27, height: "1.97 m", weight: "87 kg",
    foot: "Right", joined: "2023", contract: "Jun 2027",
    apps: 6, goals: 0, assists: 0, saves: 13, cleanSheets: 2, rating: 70,
    onLoan: false, espnId: 274272, photo: LOCAL("altay-bayindir"),
    bio: "Backup goalkeeper who joined from Fenerbahçe. A reliable shot-stopper with excellent reflexes.",
  },
  {
    id: 2, number: 22, name: "Tom", surname: "Heaton",
    pos: "GK", cat: "GK", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Apr 15, 1986", age: 39, height: "1.88 m", weight: "84 kg",
    foot: "Right", joined: "2021", contract: "Jun 2026",
    apps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 67,
    onLoan: false, espnId: 42250, photo: LOCAL("tom-heaton"),
    bio: "Veteran goalkeeper and Academy graduate in his second spell at the club. Highly valued member of the goalkeeping group.",
  },
  {
    id: 3, number: 31, name: "Senne", surname: "Lammens",
    pos: "GK", cat: "GK", country: "Belgium", flag: "🇧🇪",
    born: "May 27, 2001", age: 23, height: "1.91 m", weight: "82 kg",
    foot: "Right", joined: "2025", contract: "Jun 2030",
    apps: 23, goals: 0, assists: 0, saves: 53, cleanSheets: 5, rating: 72,
    onLoan: false, espnId: 301425, photo: "/players/senne-lammens.webp",
    bio: "Young Belgian goalkeeper signed from Royal Antwerp. An impressive shot-stopper who has made 53 saves this season.",
  },

  // DEFENDERS
  {
    id: 4, number: 2, name: "Diogo", surname: "Dalot",
    pos: "RB", cat: "DEF", country: "Portugal", flag: "🇵🇹",
    born: "Mar 18, 1999", age: 26, height: "1.83 m", weight: "78 kg",
    foot: "Right", joined: "2019", contract: "Jun 2028",
    apps: 27, goals: 1, assists: 3, saves: 0, cleanSheets: 0, rating: 77,
    onLoan: false, espnId: 238902, photo: LOCAL("diogo-dalot"),
    bio: "Attacking full-back and vice-captain. Known for his tireless runs down the right flank and composed defending.",
  },
  {
    id: 5, number: 3, name: "Noussair", surname: "Mazraoui",
    pos: "RB", cat: "DEF", country: "Morocco", flag: "🇲🇦",
    born: "Nov 14, 1997", age: 28, height: "1.81 m", weight: "75 kg",
    foot: "Right", joined: "2024", contract: "Jun 2028",
    apps: 15, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 75,
    onLoan: false, espnId: 239350, photo: LOCAL("noussair-mazraoui"),
    bio: "Versatile Moroccan full-back signed from Bayern Munich. Experienced in the Champions League.",
  },
  {
    id: 6, number: 4, name: "Matthijs", surname: "de Ligt",
    pos: "CB", cat: "DEF", country: "Netherlands", flag: "🇳🇱",
    born: "Aug 12, 1999", age: 26, height: "1.89 m", weight: "85 kg",
    foot: "Right", joined: "2024", contract: "Jun 2029",
    apps: 13, goals: 1, assists: 0, saves: 0, cleanSheets: 0, rating: 76,
    onLoan: false, espnId: 239349, photo: LOCAL("matthijs-de-ligt"),
    bio: "Commanding Dutch centre-back signed from Bayern Munich. Former Ajax and Juventus defender.",
  },
  {
    id: 7, number: 5, name: "Harry", surname: "Maguire",
    pos: "CB", cat: "DEF", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Mar 5, 1993", age: 33, height: "1.94 m", weight: "100 kg",
    foot: "Right", joined: "2019", contract: "Jun 2025",
    apps: 16, goals: 1, assists: 1, saves: 0, cleanSheets: 0, rating: 73,
    onLoan: false, espnId: 157073, photo: LOCAL("harry-maguire"),
    bio: "Experienced centre-back and former club captain. Strong in the air and a composed ball-playing defender.",
  },
  {
    id: 8, number: 6, name: "Lisandro", surname: "Martínez",
    pos: "CB", cat: "DEF", country: "Argentina", flag: "🇦🇷",
    born: "Jan 18, 1998", age: 28, height: "1.75 m", weight: "78 kg",
    foot: "Left", joined: "2022", contract: "Jun 2027",
    apps: 14, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 79,
    onLoan: false, espnId: 233937, photo: LOCAL("lisandro-martinez"),
    bio: "Fiercely competitive Argentine defender nicknamed 'The Butcher'. World Cup winner with Argentina in 2022.",
  },
  {
    id: 9, number: 12, name: "Tyrell", surname: "Malacia",
    pos: "LB", cat: "DEF", country: "Netherlands", flag: "🇳🇱",
    born: "Aug 17, 2000", age: 26, height: "1.70 m", weight: "65 kg",
    foot: "Left", joined: "2022", contract: "Jun 2027",
    apps: 2, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 71,
    onLoan: false, espnId: 259863, photo: LOCAL("tyrell-malacia"),
    bio: "Dutch left-back returning from a long injury. Pacey and direct with good defensive instincts.",
  },
  {
    id: 10, number: 13, name: "Patrick", surname: "Dorgu",
    pos: "LB", cat: "DEF", country: "Denmark", flag: "🇩🇰",
    born: "Jan 29, 2004", age: 21, height: "1.84 m", weight: "76 kg",
    foot: "Left", joined: "2025", contract: "Jun 2030",
    apps: 22, goals: 3, assists: 3, saves: 0, cleanSheets: 0, rating: 77,
    onLoan: false, espnId: 366781, photo: LOCAL("patrick-dorgu"),
    bio: "Dynamic Danish full-back signed from Lecce. Has scored 3 goals this season — impressive for a defender.",
  },
  {
    id: 11, number: 15, name: "Leny", surname: "Yoro",
    pos: "CB", cat: "DEF", country: "France", flag: "🇫🇷",
    born: "Nov 20, 2005", age: 20, height: "1.90 m", weight: "80 kg",
    foot: "Right", joined: "2024", contract: "Jun 2029",
    apps: 26, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 77,
    onLoan: false, espnId: 340206, photo: LOCAL("leny-yoro"),
    bio: "One of Europe's most exciting young defenders. Joined from Lille in 2024, already 26 appearances this season.",
  },
  {
    id: 12, number: 23, name: "Luke", surname: "Shaw",
    pos: "LB", cat: "DEF", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Jul 12, 1995", age: 30, height: "1.85 m", weight: "75 kg",
    foot: "Left", joined: "2014", contract: "Jun 2027",
    apps: 29, goals: 0, assists: 1, saves: 0, cleanSheets: 0, rating: 74,
    onLoan: false, espnId: 167127, photo: LOCAL("luke-shaw"),
    bio: "Experienced left-back at United for over a decade. Euro 2020 finalist with England.",
  },
  {
    id: 13, number: 26, name: "Ayden", surname: "Heaven",
    pos: "CB", cat: "DEF", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Jun 14, 2006", age: 19, height: "1.87 m", weight: "78 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2028",
    apps: 13, goals: 0, assists: 1, saves: 0, cleanSheets: 0, rating: 69,
    onLoan: false, espnId: 356044, photo: LOCAL("ayden-heaven"),
    bio: "Highly-rated Academy centre-back who has made 13 appearances this season. England youth international.",
  },
  {
    id: 14, number: 33, name: "Tyler", surname: "Fredricson",
    pos: "CB", cat: "DEF", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Jan 10, 2005", age: 21, height: "1.88 m", weight: "80 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2027",
    apps: 1, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 66,
    onLoan: false, espnId: 347052, photo: LOCAL("tyler-fredricson"),
    bio: "Academy graduate centre-back who earned his senior opportunity through strong performances.",
  },
  {
    id: 15, number: 35, name: "Diego", surname: "León",
    pos: "RB", cat: "DEF", country: "Paraguay", flag: "🇵🇾",
    born: "Dec 27, 2003", age: 21, height: "1.77 m", weight: "70 kg",
    foot: "Right", joined: "2023", contract: "Jun 2027",
    apps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 66,
    onLoan: false, espnId: 387634, photo: LOCAL("diego-leon"),
    bio: "Young Paraguayan defender with bags of potential. Has been part of the first team training group.",
  },
  {
    id: 16, number: 72, name: "Godwill", surname: "Kukonki",
    pos: "CB", cat: "DEF", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Jan 12, 2006", age: 18, height: "1.95 m", weight: "85 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2027",
    apps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 65,
    onLoan: false, espnId: 393747, photo: LOCAL("godwill-kukonki"),
    bio: "Towering Academy centre-back with exceptional physical presence. One of the most promising young defenders.",
  },

  // MIDFIELDERS
  {
    id: 17, number: 7, name: "Mason", surname: "Mount",
    pos: "CM", cat: "MID", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Jan 10, 2000", age: 25, height: "1.81 m", weight: "70 kg",
    foot: "Right", joined: "2023", contract: "Jun 2028",
    apps: 17, goals: 3, assists: 0, saves: 0, cleanSheets: 0, rating: 73,
    onLoan: false, espnId: 231167, photo: LOCAL("mason-mount"),
    bio: "Creative English midfielder signed from Chelsea. Technical and industrious with an eye for goal.",
  },
  {
    id: 18, number: 8, name: "Bruno", surname: "Fernandes",
    pos: "CAM", cat: "MID", country: "Portugal", flag: "🇵🇹",
    born: "Sep 8, 1994", age: 31, height: "1.79 m", weight: "69 kg",
    foot: "Right", joined: "2020", contract: "Jun 2026",
    apps: 26, goals: 7, assists: 14, saves: 0, cleanSheets: 0, rating: 86,
    captain: true,
    onLoan: false, espnId: 124091, photo: LOCAL("bruno-fernandes"),
    bio: "Club captain and creative engine. Set a new Man United PL assist record this season. Three-time Sir Matt Busby Player of the Year.",
  },
  {
    id: 19, number: 18, name: "", surname: "Casemiro",
    pos: "DM", cat: "MID", country: "Brazil", flag: "🇧🇷",
    born: "Feb 23, 1992", age: 34, height: "1.85 m", weight: "84 kg",
    foot: "Right", joined: "2022", contract: "Jun 2026",
    apps: 27, goals: 6, assists: 2, saves: 0, cleanSheets: 0, rating: 74,
    onLoan: false, espnId: 173666, photo: LOCAL("casemiro"),
    bio: "Defensive midfield enforcer and Brazilian international. Five-time Champions League winner with Real Madrid.",
  },
  {
    id: 20, number: 25, name: "Manuel", surname: "Ugarte",
    pos: "DM", cat: "MID", country: "Uruguay", flag: "🇺🇾",
    born: "Apr 11, 2001", age: 24, height: "1.82 m", weight: "80 kg",
    foot: "Right", joined: "2024", contract: "Jun 2029",
    apps: 19, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 77,
    onLoan: false, espnId: 241468, photo: LOCAL("manuel-ugarte"),
    bio: "Tenacious Uruguayan holding midfielder. Excels at breaking up play and winning back possession.",
  },
  {
    id: 21, number: 37, name: "Kobbie", surname: "Mainoo",
    pos: "CM", cat: "MID", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Apr 19, 2005", age: 20, height: "1.77 m", weight: "68 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2027",
    apps: 20, goals: 0, assists: 2, saves: 0, cleanSheets: 0, rating: 79,
    onLoan: false, espnId: 328466, photo: LOCAL("kobbie-mainoo"),
    bio: "Academy product and England international. Scored the winner in the 2024 FA Cup Final.",
  },
  {
    id: 22, number: 38, name: "Jack", surname: "Fletcher",
    pos: "CM", cat: "MID", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Mar 5, 2006", age: 18, height: "1.81 m", weight: "72 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2027",
    apps: 3, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 65,
    onLoan: false, espnId: 205081, photo: LOCAL("jack-fletcher"),
    bio: "Talented young Academy midfielder who has made his first team debut this season.",
  },
  {
    id: 23, number: 39, name: "Tyler", surname: "Fletcher",
    pos: "CM", cat: "MID", country: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    born: "Jun 12, 2006", age: 18, height: "1.80 m", weight: "70 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2027",
    apps: 1, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 64,
    onLoan: false, espnId: 393138, photo: LOCAL("tyler-fletcher"),
    bio: "Young Scottish midfielder from the Academy who made his senior debut this season.",
  },
  {
    id: 24, number: 48, name: "Jack", surname: "Moorhouse",
    pos: "CM", cat: "MID", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Feb 8, 2004", age: 20, height: "1.80 m", weight: "72 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2026",
    apps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 64,
    onLoan: false, espnId: 369884, photo: LOCAL("jack-moorhouse"),
    bio: "Academy midfielder who has been training with the first team squad this season.",
  },

  // FORWARDS
  {
    id: 25, number: 10, name: "Matheus", surname: "Cunha",
    pos: "ST", cat: "FWD", country: "Brazil", flag: "🇧🇷",
    born: "Jun 27, 1999", age: 26, height: "1.81 m", weight: "76 kg",
    foot: "Right", joined: "2025", contract: "Jun 2030",
    apps: 26, goals: 6, assists: 2, saves: 0, cleanSheets: 0, rating: 80,
    onLoan: false, espnId: 259902, photo: LOCAL("matheus-cunha"),
    bio: "Dynamic Brazilian forward signed from Wolves. Known for his dribbling and creativity in tight spaces.",
  },
  {
    id: 26, number: 11, name: "Joshua", surname: "Zirkzee",
    pos: "ST", cat: "FWD", country: "Netherlands", flag: "🇳🇱",
    born: "May 22, 2001", age: 24, height: "1.93 m", weight: "85 kg",
    foot: "Right", joined: "2024", contract: "Jun 2029",
    apps: 18, goals: 2, assists: 1, saves: 0, cleanSheets: 0, rating: 72,
    onLoan: false, espnId: 276327, photo: LOCAL("joshua-zirkzee"),
    bio: "Tall Dutch forward with exceptional technique and link-up play. Signed from Bologna for £36.5m.",
  },
  {
    id: 27, number: 16, name: "Amad", surname: "Diallo",
    pos: "RW", cat: "FWD", country: "Côte d'Ivoire", flag: "🇨🇮",
    born: "Jul 11, 2002", age: 23, height: "1.74 m", weight: "63 kg",
    foot: "Right", joined: "2021", contract: "Jun 2028",
    apps: 23, goals: 2, assists: 2, saves: 0, cleanSheets: 0, rating: 80,
    onLoan: false, espnId: 291630, photo: LOCAL("amad-diallo"),
    bio: "Electrifying Ivorian winger with tricky footwork. One of United's most dangerous attackers.",
  },
  {
    id: 28, number: 19, name: "Bryan", surname: "Mbeumo",
    pos: "RW", cat: "FWD", country: "Cameroon", flag: "🇨🇲",
    born: "Aug 7, 1999", age: 26, height: "1.74 m", weight: "68 kg",
    foot: "Left", joined: "2025", contract: "Jun 2030",
    apps: 24, goals: 9, assists: 3, saves: 0, cleanSheets: 0, rating: 81,
    onLoan: false, espnId: 271170, photo: LOCAL("bryan-mbeumo"),
    bio: "Top scorer this season with 9 goals. Cameroon international signed from Brentford — clinical and direct.",
  },
  {
    id: 29, number: 30, name: "Benjamin", surname: "Sesko",
    pos: "ST", cat: "FWD", country: "Slovenia", flag: "🇸🇮",
    born: "May 31, 2003", age: 22, height: "1.95 m", weight: "83 kg",
    foot: "Right", joined: "2025", contract: "Jun 2030",
    apps: 24, goals: 8, assists: 1, saves: 0, cleanSheets: 0, rating: 79,
    onLoan: false, espnId: 289155, photo: LOCAL("benjamin-sesko"),
    bio: "Towering Slovenian striker signed from RB Leipzig. 8 goals in 24 appearances — clinical in the box.",
  },
  {
    id: 30, number: 32, name: "Chido", surname: "Obi",
    pos: "ST", cat: "FWD", country: "Denmark", flag: "🇩🇰",
    born: "Apr 23, 2007", age: 18, height: "1.88 m", weight: "78 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2026",
    apps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 67,
    onLoan: false, espnId: 375738, photo: LOCAL("chido-obi"),
    bio: "Exciting teenage striker from the Academy. Exceptional physical presence and raw goal-scoring ability.",
  },
  {
    id: 31, number: 61, name: "Shea", surname: "Lacey",
    pos: "LW", cat: "FWD", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Sep 3, 2006", age: 18, height: "1.70 m", weight: "65 kg",
    foot: "Left", joined: "Academy", contract: "Jun 2027",
    apps: 2, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 64,
    onLoan: false, espnId: 358180, photo: LOCAL("shea-lacey"),
    bio: "Pacey young winger from the Academy who has made his senior debut this season.",
  },
  {
    id: 32, number: 70, name: "Bendito", surname: "Mantato",
    pos: "ST", cat: "FWD", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    born: "Nov 15, 2006", age: 18, height: "1.82 m", weight: "75 kg",
    foot: "Right", joined: "Academy", contract: "Jun 2027",
    apps: 1, goals: 0, assists: 0, saves: 0, cleanSheets: 0, rating: 64,
    onLoan: false, espnId: 379856, photo: LOCAL("bendito-mantato"),
    bio: "Young Academy striker who made his first team appearance this season.",
  },
];

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const FILTERS = [
  { label: "TË GJITHË", value: "ALL" },
  { label: "PORTIERËT",  value: "GK"  },
  { label: "MBROJTËSIT", value: "DEF" },
  { label: "MESFUSHORËT",value: "MID" },
  { label: "SULMUESIT",  value: "FWD" },
];

const SECTION_MAP = [
  { title: "Portierët",    cat: "GK",  num: "01" },
  { title: "Mbrojtësit",  cat: "DEF", num: "02" },
  { title: "Mesfushorët", cat: "MID", num: "03" },
  { title: "Sulmuesit",   cat: "FWD", num: "04" },
];

const POS_COLORS = {
  GK:  { bg: "#f59e0b", text: "#000" },
  CB:  { bg: "#3b82f6", text: "#fff" },
  LB:  { bg: "#3b82f6", text: "#fff" },
  RB:  { bg: "#3b82f6", text: "#fff" },
  DM:  { bg: "#10b981", text: "#fff" },
  CM:  { bg: "#10b981", text: "#fff" },
  CAM: { bg: "#10b981", text: "#fff" },
  ST:  { bg: "#CC0000", text: "#fff" },
  LW:  { bg: "#CC0000", text: "#fff" },
  RW:  { bg: "#CC0000", text: "#fff" },
};

function ratingColor(r) {
  if (r >= 83) return "#ffd700";
  if (r >= 77) return "#4ade80";
  return "#94a3b8";
}

// ── STAT BAR ──────────────────────────────────────────────────────────────────
function StatBar({ value, max, color = "#CC0000" }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height: 4, flex: 1, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100,(value/max)*100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
    </div>
  );
}

function StatRow({ label, value, max, color = "#CC0000" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 130, fontSize: 11, color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>{label}</div>
      <StatBar value={value} max={max} color={color} />
      <div style={{ width: 28, textAlign: "right", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{value}</div>
    </div>
  );
}

// ── PLAYER MODAL ──────────────────────────────────────────────────────────────
function PlayerModal({ player, onClose, onPrev, onNext }) {
  const [tab, setTab] = useState("profile");
  const navigate = useNavigate();
  const pc = POS_COLORS[player.pos] || { bg: "#CC0000", text: "#fff" };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 960,
        background: "#0a0000",
        border: "1px solid rgba(204,0,0,0.25)",
        borderRadius: 20, overflow: "hidden",
        display: "grid", gridTemplateColumns: "280px 1fr",
        minHeight: 560, position: "relative",
        boxShadow: "0 0 60px rgba(204,0,0,0.2), 0 40px 80px rgba(0,0,0,0.8)",
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ position: "relative", overflow: "hidden", minHeight: 560 }}>

          {/* Full-bleed photo */}
          {player.photo && (
            <img src={player.photo} alt={player.surname}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
          )}

          {/* Gradient overlays */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.92) 75%, rgba(0,0,0,0.98) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent 60%, rgba(0,0,0,0.4) 100%)` }} />

          {/* Position color top accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${pc.bg}, transparent)` }} />

          {/* Large faded number */}
          <div style={{ position: "absolute", top: -10, right: -8, fontSize: 160, fontWeight: 900,
            color: "rgba(255,255,255,0.06)", lineHeight: 1, userSelect: "none", fontStyle: "italic" }}>
            {player.number}
          </div>

          {/* Top badges */}
          <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
            <div style={{ padding: "4px 12px", borderRadius: 5, fontSize: 10, fontWeight: 800,
              letterSpacing: 2, background: pc.bg, color: pc.text, textTransform: "uppercase",
              boxShadow: "0 2px 10px rgba(0,0,0,0.5)", display: "inline-block", width: "fit-content" }}>
              {player.pos}
            </div>
            {player.captain && (
              <div style={{ padding: "3px 10px", borderRadius: 4, fontSize: 8, fontWeight: 800,
                letterSpacing: 2, background: "linear-gradient(135deg, #b8860b, #ffd700)", color: "#000",
                textTransform: "uppercase", display: "inline-block", width: "fit-content",
                boxShadow: "0 2px 10px rgba(255,215,0,0.4)" }}>
                ©&nbsp;KAPITEN
              </div>
            )}
            {player.onLoan && (
              <div style={{ padding: "3px 10px", borderRadius: 4, fontSize: 8, fontWeight: 800,
                letterSpacing: 2, background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(255,255,255,0.2)", textTransform: "uppercase", display: "inline-block", width: "fit-content" }}>
                ON LOAN
              </div>
            )}
          </div>

          {/* Placeholder if no photo */}
          {!player.photo && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
              background: "linear-gradient(170deg, #1c0404 0%, #0a0000 100%)" }}>
              <svg width="64" height="80" viewBox="0 0 54 68" fill="none">
                <circle cx="27" cy="13" r="11" fill="rgba(204,0,0,0.18)" />
                <path d="M4 62c0-13 8-22 23-22s23 9 23 22" stroke="rgba(204,0,0,0.18)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.12)", letterSpacing: 2, lineHeight: 1.8, textAlign: "center" }}>FOTO<br/>DUKE U SHTUAR</span>
            </div>
          )}

          {/* Bottom content overlay */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 20px", zIndex: 2 }}>
            {player.name && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 1, marginBottom: 2 }}>{player.name}</div>}
            <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, letterSpacing: -1,
              textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>{player.surname || player.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 5, marginBottom: 16 }}>{player.flag} {player.country}</div>

            {/* Rating row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4,
                background: "rgba(0,0,0,0.6)", border: "1px solid rgba(204,0,0,0.3)",
                borderRadius: 8, padding: "6px 14px", backdropFilter: "blur(6px)" }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: ratingColor(player.rating), lineHeight: 1 }}>{player.rating}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5 }}>RTG</span>
              </div>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>#{player.number}</span>
            </div>

            {/* Buy shirt */}
            <button onClick={() => navigate("/Store")} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "linear-gradient(135deg, #CC0000, #990000)",
              color: "white", padding: "11px 20px", borderRadius: 8,
              fontWeight: 800, fontSize: 10, letterSpacing: 2,
              border: "none", cursor: "pointer", textTransform: "uppercase",
              boxShadow: "0 4px 20px rgba(204,0,0,0.4)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              BLEJ FANELLËN #{player.number}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

          {/* Surname watermark */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            fontSize: 100, fontWeight: 900, color: "rgba(204,0,0,0.04)", whiteSpace: "nowrap",
            userSelect: "none", letterSpacing: -4, pointerEvents: "none", zIndex: 0 }}>
            {(player.surname || player.name).toUpperCase()}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 28px", position: "relative", zIndex: 1 }}>
            {[["profile","PROFILI"],["stats","STATISTIKAT"]].map(([val,lbl]) => (
              <button key={val} onClick={() => setTab(val)} style={{
                padding: "20px 18px 18px", fontSize: 11, fontWeight: 700, letterSpacing: 2,
                color: tab === val ? "#CC0000" : "rgba(255,255,255,0.28)",
                border: "none", background: "none", cursor: "pointer",
                borderBottom: tab === val ? "2px solid #CC0000" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.2s",
              }}>{lbl}</button>
            ))}
            <button onClick={onClose} style={{
              marginLeft: "auto", padding: "20px 0 18px",
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.2)", fontSize: 22, lineHeight: 1,
              transition: "color 0.2s",
            }}>✕</button>
          </div>

          <div style={{ padding: "24px 28px", flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>

            {/* PROFILE TAB */}
            {tab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.8, margin: 0,
                  borderLeft: `3px solid ${pc.bg}`, paddingLeft: 14 }}>{player.bio}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["I lindur", player.born],
                    ["Mosha", `${player.age} vjeç`],
                    ["Gjatësia", player.height],
                    ["Pesha", player.weight],
                    ["Këmba preferuare", player.foot],
                    ["Bashkuar", player.joined],
                    ["Kontrata deri", player.contract],
                    ["Numri", `#${player.number}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 8, padding: "10px 14px",
                      transition: "border-color 0.2s",
                    }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATS TAB */}
            {tab === "stats" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Big stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {(player.cat === "GK"
                    ? [{ label: "NDESHJE", value: player.apps, color: "#94a3b8" },
                       { label: "PORTË TË MBYLLURA", value: player.cleanSheets, color: "#10b981" },
                       { label: "PRITJE", value: player.saves, color: "#3b82f6" }]
                    : [{ label: "NDESHJE", value: player.apps, color: "#94a3b8" },
                       { label: "GOLA", value: player.goals, color: "#CC0000" },
                       { label: "ASISTE", value: player.assists, color: "#3b82f6" }]
                  ).map(s => (
                    <div key={s.label} style={{
                      background: `linear-gradient(135deg, rgba(${s.color === "#CC0000" ? "204,0,0" : s.color === "#10b981" ? "16,185,129" : s.color === "#3b82f6" ? "59,130,246" : "148,163,184"},0.1) 0%, rgba(0,0,0,0.3) 100%)`,
                      border: `1px solid ${s.color}30`,
                      borderRadius: 12, padding: "18px 12px", textAlign: "center",
                      position: "relative", overflow: "hidden",
                    }}>
                      <div style={{ position: "absolute", bottom: -10, right: -4, fontSize: 60, fontWeight: 900,
                        color: `${s.color}12`, lineHeight: 1, userSelect: "none" }}>{s.value}</div>
                      <div style={{ fontSize: 46, fontWeight: 900, color: s.color, lineHeight: 1, position: "relative" }}>{s.value}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginTop: 6, textTransform: "uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Stat bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 3, marginBottom: 2, textTransform: "uppercase" }}>Performanca 2025/26</div>
                  {player.cat === "GK" ? (
                    <>
                      <StatRow label="Ndeshje" value={player.apps} max={38} color="#94a3b8" />
                      <StatRow label="Portë të mbyllura" value={player.cleanSheets} max={20} color="#10b981" />
                      <StatRow label="Pritje" value={player.saves} max={130} color="#3b82f6" />
                      <StatRow label="Vlerësimi" value={player.rating} max={100} color="#ffd700" />
                    </>
                  ) : (
                    <>
                      <StatRow label="Ndeshje" value={player.apps} max={38} color="#94a3b8" />
                      <StatRow label="Gola" value={player.goals} max={20} color="#CC0000" />
                      <StatRow label="Asiste" value={player.assists} max={20} color="#3b82f6" />
                      <StatRow label="Vlerësimi" value={player.rating} max={100} color="#ffd700" />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 28px", borderTop: "1px solid rgba(255,255,255,0.05)",
            position: "relative", zIndex: 1,
          }}>
            <button onClick={onPrev} style={navBtn}>← I MËPARSHMI</button>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: 2 }}>MANCHESTER UNITED FC</div>
            <button onClick={onNext} style={navBtn}>I ARDHSHMI →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const navBtn = {
  background: "none", border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.32)", padding: "8px 16px",
  borderRadius: 6, cursor: "pointer", fontSize: 10, letterSpacing: 1.5, fontWeight: 700,
};

// ── CAROUSEL ROW ──────────────────────────────────────────────────────────────
function CarouselRow({ players: rowP, onSelect }) {
  const [active, setActive] = useState(Math.floor(rowP.length / 2));
  const [hoveredId, setHoveredId] = useState(null);
  const move = dir => setActive(i => (i + dir + rowP.length) % rowP.length);

  return (
    <div style={{ position: "relative", padding: "38px 0 28px" }}>
      {[["left",-1,"‹"],["right",1,"›"]].map(([side,dir,lbl]) => (
        <button key={side} onClick={() => move(dir)} style={{
          position: "absolute", top: "50%", [side]: 18, transform: "translateY(-50%)",
          zIndex: 20, background: "rgba(204,0,0,0.15)",
          border: "1px solid rgba(204,0,0,0.3)", color: "white",
          width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
          fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
        }}>{lbl}</button>
      ))}

      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 10, padding: "0 72px", overflow: "hidden" }}>
        {rowP.map((p, i) => {
          const off = ((i - active + rowP.length) % rowP.length);
          const signedOff = off > rowP.length / 2 ? off - rowP.length : off;
          if (Math.abs(signedOff) > 2) return null;
          const isA = signedOff === 0;
          const isN = Math.abs(signedOff) === 1;
          const w = isA ? 215 : isN ? 162 : 122;
          const h = isA ? 305 : isN ? 234 : 180;
          const pc = POS_COLORS[p.pos] || { bg: "#CC0000", text: "#fff" };

          return (
            <div key={p.id}
              onClick={() => isA ? onSelect(p) : setActive(i)}
              onMouseEnter={() => !isA && setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
              flexShrink: 0, width: w, height: h, borderRadius: 16,
              background: isA
                ? "linear-gradient(155deg, rgba(55,8,8,0.97) 0%, rgba(12,2,2,0.99) 100%)"
                : "linear-gradient(155deg, rgba(28,4,4,0.92) 0%, rgba(7,1,1,0.96) 100%)",
              border: isA
                ? "1px solid rgba(204,0,0,0.65)"
                : hoveredId === p.id ? "1px solid rgba(204,0,0,0.3)" : "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", overflow: "hidden",
              transition: "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.2s ease",
              willChange: "transform, opacity",
              transform: `scale(${isA ? 1 : isN ? (hoveredId === p.id ? 0.88 : 0.84) : (hoveredId === p.id ? 0.76 : 0.72)}) translateY(${isA?0:isN?22:40}px)`,
              opacity: isA ? 1 : hoveredId === p.id ? (isN ? 0.85 : 0.55) : (isN ? 0.65 : 0.35),
              zIndex: isA ? 10 : hoveredId === p.id ? 6 : isN ? 5 : 1,
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              padding: 14, position: "relative",
              boxShadow: isA
                ? "0 0 35px rgba(204,0,0,0.45), 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,80,80,0.12)"
                : hoveredId === p.id ? "0 0 18px rgba(204,0,0,0.25), 0 12px 32px rgba(0,0,0,0.6)" : "0 8px 24px rgba(0,0,0,0.55)",
            }}>

              {/* Top accent line */}
              {isA && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 5,
                  background: "linear-gradient(90deg, transparent 0%, #CC0000 25%, #ff5555 50%, #CC0000 75%, transparent 100%)",
                  borderRadius: "16px 16px 0 0",
                }} />
              )}

              {/* Diagonal shine overlay */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 35%, transparent 55%)",
              }} />

              {/* Big number watermark */}
              <div style={{ position: "absolute", top: -12, right: -2, fontSize: isA?100:68, fontWeight: 900,
                color: "rgba(204,0,0,0.13)", lineHeight: 1, userSelect: "none", fontStyle: "italic",
              }}>{p.number}</div>

              {/* Photo */}
              {p.photo && (
                <img src={p.photo} alt={p.surname} style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "top center",
                  opacity: isA ? 0.92 : 0.55,
                }}
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
              )}

              {/* Bottom gradient */}
              <div style={{ position: "absolute", inset: 0,
                background: "linear-gradient(0deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.04) 75%)",
              }} />

              {/* Pos badge */}
              <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3,
                padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                background: pc.bg, color: pc.text, textTransform: "uppercase",
                boxShadow: isA ? "0 2px 8px rgba(0,0,0,0.6)" : "none",
              }}>{p.pos}</div>

              {/* Rating + Captain badges (active only) */}
              {isA && (
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ background: "rgba(0,0,0,0.75)", border: "1px solid rgba(204,0,0,0.45)", borderRadius: 6, padding: "3px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: ratingColor(p.rating), lineHeight: 1 }}>{p.rating}</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginTop: 1 }}>RTG</div>
                  </div>
                  {p.captain && (
                    <div style={{ background: "linear-gradient(135deg, #b8860b, #ffd700)", borderRadius: 6, padding: "3px 10px", textAlign: "center", boxShadow: "0 2px 8px rgba(255,215,0,0.45)" }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#000", lineHeight: 1, letterSpacing: 1 }}>C</div>
                    </div>
                  )}
                </div>
              )}

              {/* On loan badge */}
              {p.onLoan && !isA && (
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3,
                  padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700, letterSpacing: 1,
                  background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.18)", textTransform: "uppercase",
                }}>ON LOAN</div>
              )}

              <div style={{ position: "relative", zIndex: 2 }}>
                {isA && p.name && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginBottom: 1 }}>{p.name}</div>}
                <div style={{ fontSize: isA?20:13, fontWeight: 900, lineHeight: 1.1, color: "white",
                  textShadow: isA ? "0 2px 10px rgba(0,0,0,0.9)" : "none",
                }}>{p.surname || p.name}</div>

                {isA && (
                  <>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2, marginBottom: 10 }}>{p.flag} {p.country}</div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      {[{v:p.goals,l:"Gola"},{v:p.assists,l:"Asiste"},{v:p.apps,l:"Ndeshje"}].map(s => (
                        <div key={s.l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 900, color: "#CC0000" }}>{s.v}</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={e => { e.stopPropagation(); onSelect(p); }} style={{
                      background: "linear-gradient(135deg, rgba(204,0,0,0.28), rgba(204,0,0,0.1))",
                      border: "1px solid rgba(204,0,0,0.5)",
                      color: "#ff8888", padding: "7px 0", borderRadius: 6,
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer", width: "100%",
                      boxShadow: "0 4px 14px rgba(204,0,0,0.2)",
                    }}>SHIKO PROFILIN</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
        {rowP.map((_,i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            width: i===active?22:6, height: 6, borderRadius: 99,
            background: i===active?"#CC0000":"rgba(255,255,255,0.12)",
            cursor: "pointer", transition: "all 0.3s",
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── SEASON HIGHLIGHTS ─────────────────────────────────────────────────────────
function SeasonHighlights({ players }) {
  if (!players.length) return null;
  const topScorer  = players.reduce((a, b) => b.goals   > a.goals   ? b : a);
  const topAssists = players.reduce((a, b) => b.assists > a.assists ? b : a);
  const topRating  = players.reduce((a, b) => b.rating  > a.rating  ? b : a);

  const items = [
    { label: "GOLEADOR",  sublabel: "Gola sezoni",    player: topScorer,  stat: topScorer.goals,    statLabel: "GOLA"    },
    { label: "ASISTUES",  sublabel: "Asiste sezoni",  player: topAssists, stat: topAssists.assists,  statLabel: "ASISTE"  },
    { label: "VLERËSIMI", sublabel: "Rating sezonal", player: topRating,  stat: topRating.rating,   statLabel: "RATING"  },
  ];

  return (
    <div style={{ padding: "28px 52px 8px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
      {items.map(({ label, player, stat, statLabel }) => (
        <div key={label} style={{
          background: "linear-gradient(135deg, rgba(45,6,6,0.92) 0%, rgba(14,2,2,0.96) 100%)",
          border: "1px solid rgba(204,0,0,0.22)",
          borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14,
          position: "relative", overflow: "hidden",
          boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
        }}>
          {/* Left accent */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#CC0000", borderRadius: "14px 0 0 14px" }} />

          {/* Shine */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)" }} />

          {/* Photo */}
          <div style={{ width: 54, height: 54, borderRadius: 10, overflow: "hidden", flexShrink: 0,
            border: "1px solid rgba(204,0,0,0.3)", background: "rgba(255,255,255,0.03)" }}>
            {player.photo && (
              <img src={player.photo} alt={player.surname}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, letterSpacing: 2.5, color: "#CC0000", fontWeight: 800, marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.surname}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{player.flag} {player.country}</div>
          </div>

          {/* Stat */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: "#CC0000", lineHeight: 1 }}>{stat}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.22)", letterSpacing: 2, marginTop: 2, textTransform: "uppercase" }}>{statLabel}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
function SectionHeader({ title, count, num }) {
  return (
    <div style={{ padding: "28px 52px 0", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ fontSize: 28, fontWeight: 900, color: "rgba(204,0,0,0.2)", fontStyle: "italic", lineHeight: 1, marginRight: 2, userSelect: "none" }}>{num}</span>
      <div style={{ width: 3, height: 22, background: "#CC0000", borderRadius: 99 }}/>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>{title}</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: 1 }}>{count} lojtarë</span>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Players() {
  const [players, setPlayers] = useState(_staticPlayers);
  const [filter, setFilter]   = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5001/players")
      .then(r => { if (r.data.length) setPlayers(r.data.map(mapPlayer)); })
      .catch(() => {});
  }, []);

  const modalIdx = selected ? players.findIndex(p => p.id === selected.id) : -1;
  const sections = filter === "ALL" ? SECTION_MAP : SECTION_MAP.filter(s => s.cat === filter);

  const nationalities = new Set(players.map(p => p.country)).size;
  const avgRating = Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length);

  return (
    <div style={{
      background: `
        radial-gradient(ellipse at 85% 10%, rgba(204,0,0,0.45) 0%, transparent 40%),
        radial-gradient(ellipse at 15% 80%, rgba(140,0,0,0.3) 0%, transparent 40%),
        linear-gradient(160deg, #3a0000 0%, #1c0000 50%, #0d0000 100%)
      `,
      minHeight: "100vh", color: "white", fontFamily: "Arial, sans-serif", position: "relative", overflowX: "hidden",
    }}>

      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -180, right: -180, width: 650, height: 650, borderRadius: "50%", border: "1px solid rgba(204,0,0,0.12)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -80, right: -80, width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(204,0,0,0.08)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 100, left: -200, width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(204,0,0,0.07)", pointerEvents: "none" }} />

      <div style={{ background: "#cc0000" }}>
        <Navbar />
      </div>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg,#0e0000 0%,#6B0000 55%,#CC0000 100%)",
        padding: "48px 52px 36px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, border: "1px solid rgba(255,255,255,0.03)", borderRadius: "50%" }}/>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase" }}>Sezoni 2025/26 · Old Trafford</div>
        <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: -3, lineHeight: 1, textTransform: "uppercase" }}>Lojtarët</div>
        <div style={{ fontSize: 12, marginTop: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>MANCHESTER UNITED F.C.</div>
        <div style={{ display: "flex", gap: 36, marginTop: 28 }}>
          {[{n:players.length,l:"Lojtarë"},{n:nationalities,l:"Kombësi"},{n:avgRating,l:"Rating mesatar"}].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap", padding: "18px 52px",
        background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center",
      }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: "8px 20px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
            border: "1px solid",
            borderColor: filter === f.value ? "#CC0000" : "rgba(255,255,255,0.12)",
            background: filter === f.value ? "#CC0000" : "transparent",
            color: filter === f.value ? "white" : "rgba(255,255,255,0.42)",
            transition: "all 0.2s",
          }}>{f.label}</button>
        ))}
        <div style={{ marginLeft: "auto", position: "relative", display: "flex", alignItems: "center" }}>
          <svg style={{ position: "absolute", left: 12, pointerEvents: "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kërko lojtarin..."
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20, padding: "8px 16px 8px 34px", color: "white", fontSize: 12,
              outline: "none", width: 200, transition: "border-color 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(204,0,0,0.5)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 10, background: "none", border: "none",
              color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0,
            }}>×</button>
          )}
        </div>
      </div>

      <SeasonHighlights players={players} />

      {/* SECTIONS */}
      {sections.map(sec => {
        const q = search.toLowerCase();
        const group = players.filter(p =>
          p.cat === sec.cat &&
          (q === "" || p.name.toLowerCase().includes(q) || p.surname.toLowerCase().includes(q))
        );
        if (!group.length) return null;
        return (
          <div key={sec.cat} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <SectionHeader title={sec.title} count={group.length} num={sec.num} />
            <CarouselRow players={group} onSelect={setSelected} />
          </div>
        );
      })}

      {/* MODAL */}
      {selected && (
        <PlayerModal
          player={selected}
          onClose={() => setSelected(null)}
          onPrev={() => setSelected(players[(modalIdx - 1 + players.length) % players.length])}
          onNext={() => setSelected(players[(modalIdx + 1) % players.length])}
        />
      )}
    </div>
  );
}
