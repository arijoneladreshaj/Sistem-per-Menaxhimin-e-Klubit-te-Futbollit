export const SECTOR_CONFIG = {
  lindje:   { rows: 8, cols: 10, price: 45,  vipRows: [],     vipPrice: null },
  perendim: { rows: 8, cols: 10, price: 45,  vipRows: [3, 4], vipPrice: 120  },
  veri:     { rows: 5, cols: 8,  price: 30,  vipRows: [],     vipPrice: null },
  jug:      { rows: 5, cols: 8,  price: 30,  vipRows: [],     vipPrice: null },
};

// vipRows është 1-based: rreshti 3 = ulëset 21-30 për cols=10
export const getSeatRow = (seatNum, cols) => Math.ceil(seatNum / cols);

export const isVipSeat = (seatNum, sectorId) => {
  const cfg = SECTOR_CONFIG[sectorId];
  if (!cfg || !cfg.vipRows.length) return false;
  return cfg.vipRows.includes(getSeatRow(seatNum, cfg.cols));
};

export const getSeatPrice = (seatNum, sectorId) => {
  const cfg = SECTOR_CONFIG[sectorId];
  if (!cfg) return 0;
  return isVipSeat(seatNum, sectorId) ? cfg.vipPrice : cfg.price;
};
