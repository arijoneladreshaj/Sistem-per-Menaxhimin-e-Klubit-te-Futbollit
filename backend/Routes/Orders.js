const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const ordersController = require("../controllers/ordersController");

router.post("/",             verifyToken,              ordersController.create);
router.get("/all",           verifyToken, requireAdmin, ordersController.getAll);
router.patch("/:id/status",  verifyToken, requireAdmin, ordersController.updateStatus);
router.get("/my",            verifyToken,              ordersController.getMy);
router.get("/:id",           verifyToken,              ordersController.getOne);
router.delete("/:id",        verifyToken,              ordersController.remove);

module.exports = router;
