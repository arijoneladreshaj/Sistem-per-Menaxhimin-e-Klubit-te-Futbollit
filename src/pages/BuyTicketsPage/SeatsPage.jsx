import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import axios from "axios";
import "./SeatsPage.css";
import { SECTOR_CONFIG, isVipSeat, getSeatPrice } from "./SectorConfig/sectorConfig";

const SECTOR_LABEL = { lindje: "Lindje", perendim: "Perëndim", veri: "Veri", jug: "Jug" };

export default function SeatsPage() {
  const navigate = useNavigate();
  const { matchId, sectorId } = useParams();
  const { addSeats } = useCart();
  const [selected, setSelected]   = useState([]);
  const [booked,   setBooked]     = useState(new Set());
  const [loading,  setLoading]    = useState(true);

  const config = SECTOR_CONFIG[sectorId];

  useEffect(() => {
    if (!matchId || !sectorId) return;
    axios.get(`http://localhost:5001/api/tickets/booked/${matchId}/${sectorId}`)
      .then(res => setBooked(new Set(res.data)))
      .catch(() => setBooked(new Set()))
      .finally(() => setLoading(false));
  }, [matchId, sectorId]);

  if (!config) return <div className="sp-error">Sektori nuk u gjet.</div>;
  if (loading)  return <div className="sp-error">Duke ngarkuar ulëset...</div>;

  const totalSeats = config.rows * config.cols;

  const isVip  = (seatNum) => isVipSeat(seatNum, sectorId);
  const getPrice = (seatNum) => getSeatPrice(seatNum, sectorId);

  const toggleSeat = (seatNum) => {
    if (booked.has(seatNum)) return;
    setSelected(prev =>
      prev.includes(seatNum) ? prev.filter(s => s !== seatNum) : [...prev, seatNum]
    );
  };

  const totalPrice = selected.reduce((sum, s) => sum + getPrice(s), 0);

  const getSeatClass = (seatNum) => {
    if (booked.has(seatNum))    return "sp-seat sp-seat--booked";
    if (selected.includes(seatNum)) return "sp-seat sp-seat--selected";
    if (isVip(seatNum))         return "sp-seat sp-seat--vip";
    return "sp-seat sp-seat--free";
  };

  const sectorName = SECTOR_LABEL[sectorId];

  return (
    <div className="sp-page">
      <div className="sp-header">
        <button className="sp-back" onClick={() => navigate(`/SectorPage/${matchId}`)}>
          ← Kthehu
        </button>
        <div className="sp-header-info">
          <span className="sp-sector-name">Sektori {sectorName}</span>
          <span className="sp-seat-count">{totalSeats} ulëse gjithsej</span>
        </div>
      </div>

      <div className="sp-field">▬▬▬ FUSHA ▬▬▬</div>

      <div className="sp-grid-wrap">
        <div className="sp-grid" style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}>
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

      <div className="sp-legend">
        <div className="sp-leg-item"><span className="sp-dot sp-dot--free" /> E lirë (€{config.price})</div>
        {config.vipRows.length > 0 && (
          <div className="sp-leg-item"><span className="sp-dot sp-dot--vip" /> VIP (€{config.vipPrice})</div>
        )}
        <div className="sp-leg-item"><span className="sp-dot sp-dot--selected" /> Zgjedhur</div>
        <div className="sp-leg-item"><span className="sp-dot sp-dot--booked" /> E zënë</div>
      </div>

      <div className="sp-selected-section">
        <div className="sp-selected-title">Selected Seats:</div>
        {selected.length === 0 ? (
          <p className="sp-selected-empty">Asnjë ulëse e zgjedhur</p>
        ) : (
          <div className="sp-selected-tags">
            {[...selected].sort((a, b) => a - b).map(s => (
              <div key={s} className={`sp-tag ${isVip(s) ? "sp-tag--vip" : ""}`} onClick={() => toggleSeat(s)}>
                {s} · €{getPrice(s)} ✕
              </div>
            ))}
          </div>
        )}
      </div>

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
            const seatsToAdd = selected.map(seatNum => ({
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
