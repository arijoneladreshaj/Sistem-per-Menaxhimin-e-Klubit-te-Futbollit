const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const preferencesController = require("../controllers/preferencesController");

router.get("/:userId", verifyToken, preferencesController.get);
router.put("/:userId", verifyToken, preferencesController.save);

module.exports = router;
