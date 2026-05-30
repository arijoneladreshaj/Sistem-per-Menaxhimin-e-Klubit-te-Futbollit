const express = require("express");
const router  = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const clubsController = require("../controllers/clubsController");

router.get("/",       clubsController.getAll);
router.get("/:id",    clubsController.getOne);
router.post("/",      verifyToken, requireRole("Admin"), clubsController.create);
router.put("/:id",    verifyToken, requireRole("Admin"), clubsController.update);
router.delete("/:id", verifyToken, requireRole("Admin"), clubsController.remove);

module.exports = router;
