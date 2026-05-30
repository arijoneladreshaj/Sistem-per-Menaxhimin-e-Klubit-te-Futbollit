const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

const DASHBOARD_ROLES = ["Admin", "Trajner", "Menaxher"];

router.get("/", verifyToken, requireRole(...DASHBOARD_ROLES), dashboardController.getStats);

module.exports = router;
