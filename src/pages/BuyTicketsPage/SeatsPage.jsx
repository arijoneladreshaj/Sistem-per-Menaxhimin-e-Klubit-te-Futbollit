import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import "./SeatsPage.css";

// Konfigurimi i ulëseve per sektor
const SECTOR_CONFIG = {
  lindje: { rows: 8, cols: 10, price: 45, vipRows: [], vipPrice: null },
  perendim: { rows: 8, cols: 10, price: 45, vipRows: [3, 4], vipPrice: 120 },
  veri: { rows: 5, cols: 8, price: 30, vipRows: [], vipPrice: null },
  jug: { rows: 5, cols: 8, price: 30, vipRows: [], vipPrice: null },
};

// Ulëse të zëna (hardcode për tani — nga backend do vijë)
const BOOKED = {
  lindje: [3, 7, 15, 22, 34, 45, 56, 67],
  perendim: [2, 9, 18, 27, 36, 45, 54, 63],
  veri: [5, 10, 18, 25, 32],
  jug: [3, 8, 15, 22, 30],
};

export default function SeatsPage() {
  const navigate = useNavigate();
  const { matchId, sectorId } = useParams();
  const { addSeats } = useCart();
  const [selected, setSelected] = useState([]);

  const config = SECTOR_CONFIG[sectorId];
  const booked = new Set(BOOKED[sectorId] || []);

  if (!config) return <div className="sp-error">Sektori nuk u gjet.</div>;

  const totalSeats = config.rows * config.cols;

  const isVip = (seatNum) => {
    if (!config.vipRows.length) return false;
    const row = Math.floor((seatNum - 1) / config.cols);
    return config.vipRows.includes(row);
  };

  const getPrice = (seatNum) =>
    isVip(seatNum) ? config.vipPrice : config.price;

  const toggleSeat = (seatNum) => {
    if (booked.has(seatNum)) return;
    setSelected((prev) =>
      prev.includes(seatNum)
        ? prev.filter((s) => s !== seatNum)
        : [...prev, seatNum],
    );
  };

  const totalPrice = selected.reduce((sum, s) => sum + getPrice(s), 0);

  const getSeatClass = (seatNum) => {
    if (booked.has(seatNum)) return "sp-seat sp-seat--booked";
    if (selected.includes(seatNum)) return "sp-seat sp-seat--selected";
    if (isVip(seatNum)) return "sp-seat sp-seat--vip";
    return "sp-seat sp-seat--free";
  };

  const sectorName = {
    lindje: "Lindje",
    perendim: "Perëndim",
    veri: "Veri",
    jug: "Jug",
  }[sectorId];

  return (
    <div className="sp-page">
      {/* HEADER */}
      <div className="sp-header">
        <button
          className="sp-back"
          onClick={() => navigate(`/SectorPage/${matchId}`)}
        >
          ← Kthehu
        </button>
        <div className="sp-header-info">
          <span className="sp-sector-name">Sektori {sectorName}</span>
          <span className="sp-seat-count">{totalSeats} ulëse gjithsej</span>
        </div>
      </div>

      {/* FUSHA — treguese drejtimi */}
      <div className="sp-field">▬▬▬ FUSHA ▬▬▬</div>

      {/* GRID ULËSEVE */}
      <div className="sp-grid-wrap">
        <div
          className="sp-grid"
          style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}
        >
          {Array.from({ length: totalSeats }, (_, i) => {
            const seatNum = i + 1;
            return (
              <div
                key={seatNum}
                className={getSeatClass(seatNum)}
                onClick={() => toggleSeat(seatNum)}
                title={`Ulëse ${seatNum}${isVip(seatNum) ? " (VIP)" : ""}`}
              >
                <span className="sp-seat-num">{seatNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEGJENDA */}
      <div className="sp-legend">
        <div className="sp-leg-item">
          <span className="sp-dot sp-dot--free" /> E lirë (€{config.price})
        </div>
        {config.vipRows.length > 0 && (
          <div className="sp-leg-item">
            <span className="sp-dot sp-dot--vip" /> VIP (€{config.vipPrice})
          </div>
        )}
        <div className="sp-leg-item">
          <span className="sp-dot sp-dot--selected" /> Zgjedhur
        </div>
        <div className="sp-leg-item">
          <span className="sp-dot sp-dot--booked" /> E zënë
        </div>
      </div>

      {/* ULËSET E ZGJEDHURA */}
      <div className="sp-selected-section">
        <div className="sp-selected-title">Selected Seats:</div>
        {selected.length === 0 ? (
          <p className="sp-selected-empty">Asnjë ulëse e zgjedhur</p>
        ) : (
          <div className="sp-selected-tags">
            {[...selected]
              .sort((a, b) => a - b)
              .map((s) => (
                <div
                  key={s}
                  className={`sp-tag ${isVip(s) ? "sp-tag--vip" : ""}`}
                  onClick={() => toggleSeat(s)}
                >
                  {s} · €{getPrice(s)} ✕
                </div>
              ))}
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div className="sp-bottom">
        <div className="sp-total">
          {selected.length > 0 && (
            <>
              <span className="sp-total-count">{selected.length} ulëse</span>
              <span className="sp-total-price">Totali: €{totalPrice}</span>
            </>
          )}
        </div>
        <button
          className={`sp-proceed ${selected.length > 0 ? "sp-proceed--active" : ""}`}
          disabled={selected.length === 0}
          onClick={() => {
            const seatsToAdd = selected.map((seatNum) => ({
              id: `${matchId}-${sectorId}-${seatNum}`,
              matchId,
              sectorId,
              sectorName,
              seatNumber: seatNum,
              price: getPrice(seatNum),
              isVip: isVip(seatNum),
              firstName: "",
              lastName: "",
            }));
            addSeats(seatsToAdd);
            navigate("/CartPage");
          }}
        >
          Proceed to Cart →
        </button>
      </div>
    </div>
  );
}
