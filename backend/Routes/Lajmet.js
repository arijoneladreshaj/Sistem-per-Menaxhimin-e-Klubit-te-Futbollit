const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const lajmetController = require("../controllers/lajmetController");

router.get("/",   verifyToken,    lajmetController.getAll);
router.post("/",     verifyToken, requireAdmin, lajmetController.create);
router.put("/:id",   verifyToken, requireAdmin, lajmetController.update);
router.delete("/:id",verifyToken, requireAdmin, lajmetController.remove);

module.exports = router;
