require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/players",   require("./routes/players"));
/*app.use("/api/clubs",     require("./routes/clubs"));
app.use("/api/matches",   require("./routes/matches"));
app.use("/api/staff",     require("./routes/staff"));
app.use("/api/transfers", require("./routes/transfers"));
app.use("/api/contracts", require("./routes/contracts"));
app.use("/api/injuries",  require("./routes/injuries"));
app.use("/api/seasons",   require("./routes/seasons"));
app.use("/api/training",  require("./routes/training"));*/

app.listen(5000, () => console.log("Server ne port 5000"));