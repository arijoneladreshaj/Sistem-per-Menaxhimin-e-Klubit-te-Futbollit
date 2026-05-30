const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const ndeshjetController = require("../controllers/ndeshjetController");

router.get("/",              ndeshjetController.getAll);
router.get("/next-upcoming", ndeshjetController.getNextUpcoming);
router.get("/:id",           ndeshjetController.getOne);
router.post("/",   verifyToken, requireAdmin, ndeshjetController.create);
router.put("/:id", verifyToken, requireAdmin, ndeshjetController.update);
router.delete("/:id", verifyToken, requireAdmin, ndeshjetController.remove);

module.exports = router;
