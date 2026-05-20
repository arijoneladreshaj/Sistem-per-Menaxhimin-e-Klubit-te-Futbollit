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


app.use("/api/players",   require("./routes/players"));
app.use("/api/staff", require("./routes/Staff"));
app.use("/api/ndeshjet",   require("./routes/Ndeshjet"));
app.use("/store", storeRoutes);
app.use("/", loginRoutes);
app.use("/", require("./Routes/Register"));

app.use("/api/players",   require("./routes/Players"));
app.use("/api/staff", require("./routes/Staff"));
app.use("/api/matches",   require("./routes/Ndeshjet"));
app.use("/api/lajme", require("./routes/Lajmet"));
app.use("/api/preferences", require("./Routes/Preferences"));
app.use("/api/shipping", require("./Routes/ShippingModal"));

/*app.use("/api/clubs",     require("./routes/clubs"));
app.use("/api/matches",   require("./routes/matches"));
app.use("/api/staff",     require("./routes/staff"));
app.use("/api/transfers", require("./routes/transfers"));
app.use("/api/contracts", require("./routes/contracts"));
app.use("/api/injuries",  require("./routes/injuries"));
app.use("/api/seasons",   require("./routes/seasons"));
app.use("/api/training",  require("./routes/training"));*/

app.listen(5000, () => console.log("Server ne port 5000"));

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
