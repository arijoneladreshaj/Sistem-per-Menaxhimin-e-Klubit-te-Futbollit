const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const adminUsersController = require("../controllers/adminUsersController");

router.get("/",          verifyToken, requireAdmin, adminUsersController.getAll);
router.post("/",         verifyToken, requireAdmin, adminUsersController.create);
router.put("/:id",       verifyToken, requireAdmin, adminUsersController.update);
router.put("/:id/role",  verifyToken, requireAdmin, adminUsersController.changeRole);
router.delete("/:id",    verifyToken, requireAdmin, adminUsersController.remove);

module.exports = router;
