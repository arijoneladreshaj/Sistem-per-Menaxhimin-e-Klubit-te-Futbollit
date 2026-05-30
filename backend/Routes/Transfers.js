const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const transfersController = require("../controllers/transfersController");

const ROLES = ["Admin", "Menaxher"];

router.get("/",      verifyToken, requireRole(...ROLES), transfersController.getAll);
router.get("/:id",   verifyToken, requireRole(...ROLES), transfersController.getOne);
router.post("/",     verifyToken, requireRole(...ROLES), transfersController.create);
router.put("/:id",   verifyToken, requireRole(...ROLES), transfersController.update);
router.delete("/:id",verifyToken, requireRole(...ROLES), transfersController.remove);

module.exports = router;
