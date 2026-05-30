const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const ticketsController = require("../controllers/ticketsController");

const MENAXHER_ROLES = ["Admin", "Menaxher"];

router.get("/booked/:matchId/:sektori",                                          ticketsController.getBooked);
router.get("/my",        verifyToken,                                            ticketsController.getMy);
router.get("/",          verifyToken, requireRole(...MENAXHER_ROLES),            ticketsController.getAll);
router.get("/match/:matchId", verifyToken, requireRole(...MENAXHER_ROLES),       ticketsController.getByMatch);
router.post("/",         verifyToken,                                            ticketsController.create);
router.put("/:id",       verifyToken, requireRole(...MENAXHER_ROLES),            ticketsController.update);
router.delete("/:id",    verifyToken,                                            ticketsController.remove);

module.exports = router;
