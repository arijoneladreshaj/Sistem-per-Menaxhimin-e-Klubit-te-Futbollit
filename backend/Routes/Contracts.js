const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const contractsController = require("../controllers/contractsController");

const ROLES = ["Admin", "Menaxher"];

router.get("/",      verifyToken, requireRole(...ROLES), contractsController.getAll);
router.get("/:id",   verifyToken, requireRole(...ROLES), contractsController.getOne);
router.post("/",     verifyToken, requireRole(...ROLES), contractsController.create);
router.put("/:id",   verifyToken, requireRole(...ROLES), contractsController.update);
router.delete("/:id",verifyToken, requireRole(...ROLES), contractsController.remove);

module.exports = router;
