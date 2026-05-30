const express = require("express");
const router  = express.Router();
const { sql, poolPromise } = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const DASHBOARD_ROLES = ["Admin", "Trajner", "Menaxher"];

const MONTHS = ["Jan","Shk","Mar","Pri","Maj","Qer","Kor","Gus","Sht","Tet","Nën","Dhj"];
const DAYS   = ["Die","Hën","Mar","Mër","Enj","Pre","Sht"];

const TRAINING_COLORS = {
  "Taktikë":   "#60a5fa",
  "Forcë":     "#4ade80",
  "Set Piece": "#DA291C",
  "Pushim":    "#fbbf24",
};

router.get("/", verifyToken, requireRole(...DASHBOARD_ROLES), async (req, res) => {
  try {
    const pool = await poolPromise;

    const [playersRes, matchesRes, injuriesRes, trainingsRes, transfersRes] = await Promise.all([

      pool.request().query(`
        SELECT TOP 6
          p.id,
          p.numri_faneles                         AS num,
          LEFT(p.emri,1) + '. ' + p.mbiemri       AS name,
          p.pozicioni                             AS pos,
          CASE p.pozicioni
            WHEN 'Portier'   THEN 'GK'
            WHEN 'Mbrojtës'  THEN 'DF'
            WHEN 'Mesfushor' THEN 'MF'
            WHEN 'Sulmues'   THEN 'FW'
            ELSE 'N/A'
          END                                     AS badge,
          p.statusi                               AS status,
          CASE p.statusi
            WHEN 'Aktiv'         THEN 'success'
            WHEN 'Lenduar'       THEN 'danger'
            WHEN 'I transferuar' THEN 'secondary'
            ELSE 'warning'
          END                                     AS statusCls
        FROM Players p
        ORDER BY p.mbiemri, p.emri
      `),

      pool.request().query(`
        SELECT TOP 5
          m.id,
          m.data_ndeshjes,
          m.lloji_kompeticionit   AS comp,
          c.emertimi              AS home,
          m.ekipi_kundershtare    AS away,
          m.rezultati_shtepia     AS scoreH,
          m.rezultati_jashte      AS scoreA
        FROM Matches m
        INNER JOIN Clubs c ON m.club_id = c.id
        WHERE m.statusi = 'Luajtur'
        ORDER BY m.data_ndeshjes DESC
      `),

      pool.request().query(`
        SELECT TOP 5
          i.id,
          p.emri + ' ' + p.mbiemri  AS player,
          i.lloji_demtimit           AS type,
          i.data_rikthimit,
          i.statusi
        FROM Injuries i
        INNER JOIN Players p ON i.player_id = p.id
        WHERE i.statusi IN ('Aktiv', 'Rikuperim')
        ORDER BY i.data_demtimit DESC
      `),

      pool.request().query(`
        SELECT TOP 5
          id,
          data_stervitjes,
          LEFT(ora_fillimit, 5)  AS time,
          lloji                  AS type,
          lokacioni              AS loc
        FROM TrainingSessions
        WHERE data_stervitjes >= CAST(GETDATE() AS DATE)
        ORDER BY data_stervitjes ASC, ora_fillimit ASC
      `),

      pool.request().query(`
        SELECT TOP 5
          id,
          emri + ' ' + mbiemri  AS player,
          vlera_tregut
        FROM Players
        WHERE statusi = 'I transferuar'
        ORDER BY updated_at DESC
      `),
    ]);

    const matches = matchesRes.recordset.map(m => {
      const d = new Date(m.data_ndeshjes);
      return {
        id:     m.id,
        date:   `${MONTHS[d.getMonth()]} ${d.getDate()}`,
        comp:   m.comp,
        home:   m.home,
        away:   m.away,
        scoreH: m.scoreH,
        scoreA: m.scoreA,
      };
    });

    const injuries = injuriesRes.recordset.map(i => {
      let eta = "E panjohur";
      if (i.data_rikthimit) {
        const weeks = Math.ceil((new Date(i.data_rikthimit) - new Date()) / (7 * 24 * 60 * 60 * 1000));
        eta = weeks > 0 ? `~${weeks} javë` : "Shumë shpejt";
      }
      return {
        id:     i.id,
        player: i.player,
        type:   i.type,
        eta,
        cls:    i.statusi === "Aktiv" ? "danger" : "warning",
      };
    });

    const trainings = trainingsRes.recordset.map(t => {
      const d = new Date(t.data_stervitjes);
      const color = Object.entries(TRAINING_COLORS).find(([k]) => t.type?.includes(k))?.[1] ?? "#60a5fa";
      return {
        id:    t.id,
        date:  `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
        time:  t.time,
        type:  t.type,
        loc:   t.loc,
        color,
      };
    });

    const transfers = transfersRes.recordset.map(t => ({
      id:     t.id,
      player: t.player,
      from:   "Klubi",
      to:     "I lirë",
      amount: t.vlera_tregut ? `€${Number(t.vlera_tregut).toLocaleString()}` : "—",
      type:   "out",
    }));

    const tickerItems = [
      ...matches.slice(0, 3).map(m => `${m.home} ${m.scoreH}-${m.scoreA} ${m.away} · ${m.comp}`),
      ...injuries.slice(0, 2).map(i => `Dëmtim: ${i.player} · ${i.type} · ${i.eta}`),
    ];

    res.json({
      players:    playersRes.recordset,
      matches,
      injuries,
      trainings,
      transfers,
      standings:  [],
      contracts:  [],
      tickerItems,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
