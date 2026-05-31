const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const storeController = require("../controllers/storeController");

const MENAXHER_ROLES = ["Admin", "Menaxher"];

router.get("/",   verifyToken,    storeController.getAll);
router.get("/:id",verifyToken,    storeController.getOne);
router.post("/",      verifyToken, requireRole(...MENAXHER_ROLES), storeController.create);
router.put("/:id",    verifyToken, requireRole(...MENAXHER_ROLES), storeController.update);
router.delete("/:id", verifyToken, requireRole(...MENAXHER_ROLES), storeController.remove);

module.exports = router;
