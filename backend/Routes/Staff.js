const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const staffController = require("../controllers/staffController");

router.get("/",      verifyToken, requireAdmin, staffController.getAll);
router.get("/:id",   verifyToken, requireAdmin, staffController.getOne);
router.post("/",     verifyToken, requireAdmin, staffController.create);
router.put("/:id",   verifyToken, requireAdmin, staffController.update);
router.delete("/:id",verifyToken, requireAdmin, staffController.remove);

module.exports = router;
