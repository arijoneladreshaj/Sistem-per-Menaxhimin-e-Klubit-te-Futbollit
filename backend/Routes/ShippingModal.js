const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const shippingController = require("../controllers/shippingController");

router.get("/:userId", verifyToken, shippingController.get);
router.put("/:userId", verifyToken, shippingController.save);

module.exports = router;
