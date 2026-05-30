const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const newsletterController = require("../controllers/newsletterController");

router.post("/", newsletterController.subscribe);
router.get("/",  verifyToken, requireAdmin, newsletterController.getAll);

module.exports = router;
