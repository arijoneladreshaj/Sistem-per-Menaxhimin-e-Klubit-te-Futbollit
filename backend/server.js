require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors    = require("cors");
const app     = express();

app.use(cors());
app.use(express.json());

// Auth (publike)
app.use("/", require("./Routes/Login"));
app.use("/", require("./Routes/Register"));

// Routes — mbrojtja vendoset brenda secilit file
app.use("/api/lajme",       require("./Routes/Lajmet"));
app.use("/api/ndeshjet",    require("./Routes/Ndeshjet"));
app.use("/api/players",     require("./Routes/Players"));
app.use("/players",         require("./Routes/Players"));
app.use("/store",           require("./Routes/Store"));
app.use("/api/training",    require("./Routes/Training"));
app.use("/api/tickets",     require("./Routes/Tickets"));
app.use("/api/staff",       require("./Routes/Staff"));
app.use("/api/injuries",    require("./Routes/Injuries"));
app.use("/api/preferences", require("./Routes/Preferences"));
app.use("/api/shipping",    require("./Routes/ShippingModal"));

app.listen(5001, () => console.log("Server ne port 5001"));
