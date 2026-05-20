const { sql, poolPromise } = require("./db");

const CAT_TO_POZ = { GK: "Portier", DEF: "Mbrojtës", MID: "Mesfushor", FWD: "Sulmues" };

function parseBorn(born) {
  if (!born) return null;
  const M = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };
  const parts = born.replace(",", "").split(" ");
  const mon = parts[0], day = parts[1], year = parts[2];
  if (!M[mon]) return null;
  return `${year}-${String(M[mon]).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

function parseHeight(h) {
  if (!h) return null;
  return Math.round(parseFloat(h) * 100);
}

function parseWeight(w) {
  if (!w) return null;
  return parseFloat(w);
}

const PLAYERS = [
  { name:"Altay",     surname:"Bayındır",    cat:"GK",  country:"Türkiye",       born:"Apr 9, 1998",   height:"1.97 m", weight:"87 kg",  number:1  },
  { name:"Tom",       surname:"Heaton",      cat:"GK",  country:"England",       born:"Apr 15, 1986",  height:"1.88 m", weight:"84 kg",  number:22 },
  { name:"Senne",     surname:"Lammens",     cat:"GK",  country:"Belgium",       born:"May 27, 2001",  height:"1.91 m", weight:"82 kg",  number:31 },
  { name:"Diogo",     surname:"Dalot",       cat:"DEF", country:"Portugal",      born:"Mar 18, 1999",  height:"1.83 m", weight:"78 kg",  number:2  },
  { name:"Noussair",  surname:"Mazraoui",    cat:"DEF", country:"Morocco",       born:"Nov 14, 1997",  height:"1.81 m", weight:"75 kg",  number:3  },
  { name:"Matthijs",  surname:"de Ligt",     cat:"DEF", country:"Netherlands",   born:"Aug 12, 1999",  height:"1.89 m", weight:"85 kg",  number:4  },
  { name:"Harry",     surname:"Maguire",     cat:"DEF", country:"England",       born:"Mar 5, 1993",   height:"1.94 m", weight:"100 kg", number:5  },
  { name:"Lisandro",  surname:"Martínez",    cat:"DEF", country:"Argentina",     born:"Jan 18, 1998",  height:"1.75 m", weight:"78 kg",  number:6  },
  { name:"Tyrell",    surname:"Malacia",     cat:"DEF", country:"Netherlands",   born:"Aug 17, 2000",  height:"1.70 m", weight:"65 kg",  number:12 },
  { name:"Patrick",   surname:"Dorgu",       cat:"DEF", country:"Denmark",       born:"Jan 29, 2004",  height:"1.84 m", weight:"76 kg",  number:13 },
  { name:"Leny",      surname:"Yoro",        cat:"DEF", country:"France",        born:"Nov 20, 2005",  height:"1.90 m", weight:"80 kg",  number:15 },
  { name:"Luke",      surname:"Shaw",        cat:"DEF", country:"England",       born:"Jul 12, 1995",  height:"1.85 m", weight:"75 kg",  number:23 },
  { name:"Ayden",     surname:"Heaven",      cat:"DEF", country:"England",       born:"Jun 14, 2006",  height:"1.87 m", weight:"78 kg",  number:26 },
  { name:"Tyler",     surname:"Fredricson",  cat:"DEF", country:"England",       born:"Jan 10, 2005",  height:"1.88 m", weight:"80 kg",  number:33 },
  { name:"Diego",     surname:"León",        cat:"DEF", country:"Paraguay",      born:"Dec 27, 2003",  height:"1.77 m", weight:"70 kg",  number:35 },
  { name:"Godwill",   surname:"Kukonki",     cat:"DEF", country:"England",       born:"Jan 12, 2006",  height:"1.95 m", weight:"85 kg",  number:72 },
  { name:"Mason",     surname:"Mount",       cat:"MID", country:"England",       born:"Jan 10, 2000",  height:"1.81 m", weight:"70 kg",  number:7  },
  { name:"Bruno",     surname:"Fernandes",   cat:"MID", country:"Portugal",      born:"Sep 8, 1994",   height:"1.79 m", weight:"69 kg",  number:8  },
  { name:"",          surname:"Casemiro",    cat:"MID", country:"Brazil",        born:"Feb 23, 1992",  height:"1.85 m", weight:"84 kg",  number:18 },
  { name:"Manuel",    surname:"Ugarte",      cat:"MID", country:"Uruguay",       born:"Apr 11, 2001",  height:"1.82 m", weight:"80 kg",  number:25 },
  { name:"Kobbie",    surname:"Mainoo",      cat:"MID", country:"England",       born:"Apr 19, 2005",  height:"1.77 m", weight:"68 kg",  number:37 },
  { name:"Jack",      surname:"Fletcher",    cat:"MID", country:"England",       born:"Mar 5, 2006",   height:"1.81 m", weight:"72 kg",  number:38 },
  { name:"Tyler",     surname:"Fletcher",    cat:"MID", country:"Scotland",      born:"Jun 12, 2006",  height:"1.80 m", weight:"70 kg",  number:39 },
  { name:"Jack",      surname:"Moorhouse",   cat:"MID", country:"England",       born:"Feb 8, 2004",   height:"1.80 m", weight:"72 kg",  number:48 },
  { name:"Matheus",   surname:"Cunha",       cat:"FWD", country:"Brazil",        born:"Jun 27, 1999",  height:"1.81 m", weight:"76 kg",  number:10 },
  { name:"Joshua",    surname:"Zirkzee",     cat:"FWD", country:"Netherlands",   born:"May 22, 2001",  height:"1.93 m", weight:"85 kg",  number:11 },
  { name:"Amad",      surname:"Diallo",      cat:"FWD", country:"Côte d'Ivoire", born:"Jul 11, 2002",  height:"1.74 m", weight:"63 kg",  number:16 },
  { name:"Bryan",     surname:"Mbeumo",      cat:"FWD", country:"Cameroon",      born:"Aug 7, 1999",   height:"1.74 m", weight:"68 kg",  number:19 },
  { name:"Benjamin",  surname:"Sesko",       cat:"FWD", country:"Slovenia",      born:"May 31, 2003",  height:"1.95 m", weight:"83 kg",  number:30 },
  { name:"Chido",     surname:"Obi",         cat:"FWD", country:"Denmark",       born:"Apr 23, 2007",  height:"1.88 m", weight:"78 kg",  number:32 },
  { name:"Shea",      surname:"Lacey",       cat:"FWD", country:"England",       born:"Sep 3, 2006",   height:"1.70 m", weight:"65 kg",  number:61 },
  { name:"Bendito",   surname:"Mantato",     cat:"FWD", country:"England",       born:"Nov 15, 2006",  height:"1.82 m", weight:"75 kg",  number:70 },
];

async function seed() {
  const pool = await poolPromise;

  const existing = await pool.request().query("SELECT COUNT(*) AS n FROM Players");
  if (existing.recordset[0].n > 0) {
    console.log(`Tabela Players ka ${existing.recordset[0].n} lojtarë — po fshij dhe ri-inserting...`);
    await pool.request().query("DELETE FROM Players");
  }

  for (const p of PLAYERS) {
    const emri     = p.name || p.surname;
    const mbiemri  = p.surname;
    const pozicioni = CAT_TO_POZ[p.cat];

    await pool.request()
      .input("club_id",       sql.Int,            1)
      .input("emri",          sql.NVarChar(100),  emri)
      .input("mbiemri",       sql.NVarChar(100),  mbiemri)
      .input("data_lindjes",  sql.Date,           parseBorn(p.born))
      .input("kombesia",      sql.NVarChar(100),  p.country || null)
      .input("pozicioni",     sql.NVarChar(20),   pozicioni)
      .input("numri_faneles", sql.TinyInt,        p.number || null)
      .input("pesha",         sql.Decimal(5, 2),  parseWeight(p.weight))
      .input("gjatesia",      sql.Decimal(5, 2),  parseHeight(p.height))
      .input("statusi",       sql.NVarChar(20),   "Aktiv")
      .input("vlera_tregut",  sql.Decimal(15, 2), 0)
      .query(`
        INSERT INTO Players
          (club_id, emri, mbiemri, data_lindjes, kombesia, pozicioni, numri_faneles, pesha, gjatesia, statusi, vlera_tregut)
        VALUES
          (@club_id, @emri, @mbiemri, @data_lindjes, @kombesia, @pozicioni, @numri_faneles, @pesha, @gjatesia, @statusi, @vlera_tregut)
      `);
    console.log(`  ✓ #${String(p.number).padStart(2)} ${emri} ${mbiemri}`);
  }

  console.log(`\n✅ ${PLAYERS.length} lojtarë u shtuan me sukses!`);
  process.exit(0);
}

seed().catch(e => { console.error("❌", e.message); process.exit(1); });
