const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const seasonsController = require("../controllers/seasonsController");

router.get("/",            verifyToken,        seasonsController.getAll);
router.get("/active",      verifyToken,        seasonsController.getActive);
router.get("/:id/stats",    verifyToken,       seasonsController.getStats);
router.get("/:id/standings",  verifyToken,     seasonsController.getStandings);
router.post("/",        verifyToken, requireAdmin, seasonsController.create);
router.put("/:id",      verifyToken, requireAdmin, seasonsController.update);
router.patch("/:id/activate", verifyToken, requireAdmin, seasonsController.activate);
router.put("/:id/standings",  verifyToken, requireAdmin, seasonsController.updateStandings);
router.delete("/:id",   verifyToken, requireAdmin, seasonsController.remove);

module.exports = router;
