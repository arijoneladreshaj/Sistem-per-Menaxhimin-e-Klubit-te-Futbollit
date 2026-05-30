const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const lineupController = require("../controllers/lineupController");

router.get("/:match_id",  verifyToken,                                lineupController.get);
router.put("/:match_id",  verifyToken, requireRole("Admin","Trajner"), lineupController.save);

module.exports = router;
