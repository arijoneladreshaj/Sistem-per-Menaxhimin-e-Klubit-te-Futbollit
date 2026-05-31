const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const homepageController = require("../controllers/homepageController");

router.get("/",   verifyToken,      homepageController.getAll);
router.put("/:key",    verifyToken, requireAdmin, homepageController.update);
router.delete("/:key", verifyToken, requireAdmin, homepageController.remove);

module.exports = router;
