const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const injuriesController = require("../controllers/injuriesController");

const TRAJNER_ROLES = ["Admin", "Trajner"];

router.get("/",      verifyToken, requireRole(...TRAJNER_ROLES), injuriesController.getAll);
router.get("/:id",   verifyToken, requireRole(...TRAJNER_ROLES), injuriesController.getOne);
router.post("/",     verifyToken, requireRole(...TRAJNER_ROLES), injuriesController.create);
router.put("/:id",   verifyToken, requireRole(...TRAJNER_ROLES), injuriesController.update);
router.delete("/:id",verifyToken, requireRole(...TRAJNER_ROLES), injuriesController.remove);

module.exports = router;
