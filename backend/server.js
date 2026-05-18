require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const app     = express();

app.use(cors());
app.use(express.json());

const players  = require("./routes/Players");
const staff    = require("./routes/Staff");
const ndeshjet = require("./routes/Ndeshjet");
const store    = require("./routes/Store");
const lajmet   = require("./routes/Lajmet");
const login    = require("./routes/login");

app.use("/players",      players);
app.use("/api/players",  players);
app.use("/staff",        staff);
app.use("/api/staff",    staff);
app.use("/ndeshjet",     ndeshjet);
app.use("/api/ndeshjet", ndeshjet);
app.use("/store",        store);
app.use("/api/lajme",    lajmet);
app.use("/",             login);

app.listen(5001, () => console.log("Server ne port 5001"));
