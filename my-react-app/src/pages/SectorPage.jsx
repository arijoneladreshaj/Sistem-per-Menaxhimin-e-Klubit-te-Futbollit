import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SectorPage.css";

const SEKTORT = [
  { id: "veri", name: "Veri" },
  { id: "jug", name: "Jug" },
  { id: "lindje", name: "Lindje" },
  { id: "perendim", name: "Perëndim" },
  { id: "vip", name: "VIP" },
];

export default function ZgjidhoSektorin() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const active = hovered || selected;

  const color = (id) => {
    if (selected === id) return "#cc0000"; //#da020a #cc0000
    if (hovered === id) return "#756969";
    if (id === "vip") return "#6A1B9A";
    if (id === "veri" || id === "jug") return "#252550";
    return "#F57F17";
  };

  const op = (id) => (selected === id || hovered === id ? 1 : 0.72);

  const props = (id) => ({
    fill: color(id),
    opacity: op(id),
    style: { cursor: "pointer", transition: "all 0.18s" },
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
    onClick: () => setSelected(id),
  });

  const aktivSektori = SEKTORT.find((s) => s.id === active);

  return (
    <div className="zs-page">
      <p className="zs-instruction">Ju lutem zgjidhni sektorin</p>

      <div className="zs-center">
        {/* ── SVG STADIUMI ── */}
        <svg
          className="zs-svg"
          viewBox="0 0 600 430"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* shell */}
          <rect
            x="4"
            y="4"
            width="592"
            height="422"
            rx="88"
            fill="#12122a"
            stroke="#252550"
            strokeWidth="2"
          />

          {/* Lindje */}
          <rect
            x="108"
            y="12"
            width="384"
            height="88"
            rx="6"
            {...props("lindje")}
          />
          <text
            x="300"
            y="52"
            textAnchor="middle"
            fill="white"
            fontSize="15"
            fontWeight="bold"
            fontFamily="Arial"
            pointerEvents="none"
          >
            Lindje
          </text>

          {/* Perendim */}
          <rect
            x="108"
            y="330"
            width="384"
            height="88"
            rx="6"
            {...props("perendim")}
          />
          <text
            x="300"
            y="370"
            textAnchor="middle"
            fill="white"
            fontSize="15"
            fontWeight="bold"
            fontFamily="Arial"
            pointerEvents="none"
          >
            Perëndim
          </text>

          {/* Jug */}
          <path d="M494,100 L588,132 L588,298 L494,330 Z" {...props("jug")} />
          <text
            x="544"
            y="212"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            fontFamily="Arial"
            pointerEvents="none"
          >
            Jug
          </text>

          {/* Veri */}
          <path d="M12,132 L106,100 L106,330 L12,298 Z" {...props("veri")} />
          <text
            x="58"
            y="212"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="bold"
            fontFamily="Arial"
            pointerEvents="none"
          >
            Veri
          </text>

          {/* FUSHA */}
          <rect
            x="106"
            y="100"
            width="388"
            height="230"
            rx="8"
            fill="#1e6b1e" //
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          {/* vijat */}
          <rect
            x="106"
            y="100"
            width="388"
            height="230"
            rx="8"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1.5"
          />
          <line
            x1="300"
            y1="100"
            x2="300"
            y2="330"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="215"
            r="32"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
          />
          <circle cx="300" cy="215" r="3" fill="rgba(255,255,255,0.45)" />
          <rect
            x="236"
            y="100"
            width="128"
            height="30"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <rect
            x="236"
            y="300"
            width="128"
            height="30"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <rect
            x="262"
            y="100"
            width="76"
            height="14"
            fill="none"
            stroke="rgba(255,255,255,0.13)"
            strokeWidth="1"
          />
          <rect
            x="262"
            y="316"
            width="76"
            height="14"
            fill="none"
            stroke="rgba(255,255,255,0.13)"
            strokeWidth="1"
          />

          {/* VIP shiriti */}
          <rect
            x="155"
            y="150"
            width="290"
            height="46"
            rx="4"
            {...props("vip")}
          />
          <text
            x="300"
            y="170"
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontWeight="bold"
            fontFamily="Arial"
            pointerEvents="none"
          >
            VIP
          </text>
          <text
            x="300"
            y="186"
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="10"
            fontFamily="Arial"
            pointerEvents="none"
          >
            €120 / ulëse
          </text>

          {/* selected outline */}
          {selected && (
            <rect
              x="4"
              y="4"
              width="592"
              height="422"
              rx="88"
              fill="none"
              stroke="#da020a"
              strokeWidth="3"
              opacity="0.35"
            />
          )}
        </svg>
      </div>

      {/* LEGJENDA */}
      <div className="zs-legend">
        <div className="zs-leg">
          <span style={{ background: "#252550" }} /> Tribuna (Lindje / Perëndim)
        </div>
        <div className="zs-leg">
          <span style={{ background: "#F57F17" }} /> Anësor (Veri / Jug)
        </div>
        <div className="zs-leg">
          <span style={{ background: "#6A1B9A" }} /> VIP
        </div>
        {selected && (
          <div className="zs-leg">
            <span style={{ background: "#da020a" }} /> Zgjedhur
          </div>
        )}
      </div>

      {/* VAZHDO */}
      <button
        className={`zs-vazhdo ${selected ? "zs-vazhdo--active" : ""}`}
        disabled={!selected}
        onClick={() => navigate(`/zgjidhouleset/${matchId}/${selected}`)}
      >
        Vazhdo
      </button>
    </div>
  );
}
