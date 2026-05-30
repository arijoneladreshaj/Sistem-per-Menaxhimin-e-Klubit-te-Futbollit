const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const trainingController = require("../controllers/trainingController");

const TRAJNER_ROLES = ["Admin", "Trajner"];

router.get("/",                verifyToken,                                trainingController.getAll);
router.get("/my-attendance",   verifyToken,                                trainingController.getMyAttendance);
router.get("/:id/attendance",  verifyToken, requireRole(...TRAJNER_ROLES), trainingController.getAttendance);
router.post("/",               verifyToken, requireRole(...TRAJNER_ROLES), trainingController.create);
router.post("/:id/attendance", verifyToken,                                trainingController.markAttendance);
router.put("/:id",             verifyToken, requireRole(...TRAJNER_ROLES), trainingController.update);
router.delete("/:id",          verifyToken, requireRole(...TRAJNER_ROLES), trainingController.remove);

module.exports = router;
