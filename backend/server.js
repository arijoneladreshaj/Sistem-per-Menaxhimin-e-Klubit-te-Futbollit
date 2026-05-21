require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors    = require("cors");
const app     = express();

app.use(cors());
app.use(express.json());

const { verifyToken } = require("./middleware/authMiddleware");

// Auth (publike)
app.use("/", require("./Routes/Login"));
app.use("/", require("./Routes/Register"));

// Publike
app.use("/store",           require("./Routes/Store"));
app.use("/players",         require("./Routes/Players"));
app.use("/ndeshjet",        require("./Routes/Ndeshjet"));
app.use("/api/lajme",       require("./Routes/Lajmet"));
app.use("/api/ndeshjet",    require("./Routes/Ndeshjet"));
app.use("/api/matches",     require("./Routes/Ndeshjet"));
app.use("/api/preferences", require("./Routes/Preferences"));
app.use("/api/shipping",    require("./Routes/ShippingModal"));
app.use("/api/training",    require("./Routes/Training"));

// Te mbrojtura — duhet token
app.use("/api/players",  verifyToken, require("./Routes/Players"));
app.use("/api/staff",    verifyToken, require("./Routes/Staff"));
app.use("/api/injuries", verifyToken, require("./Routes/Injuries"));
app.use("/staff",        verifyToken, require("./Routes/Staff"));

// Dëgjo në të dy portat
app.listen(5000, () => console.log("Server ne port 5000"));
app.listen(5001, () => console.log("Server ne port 5001"));
