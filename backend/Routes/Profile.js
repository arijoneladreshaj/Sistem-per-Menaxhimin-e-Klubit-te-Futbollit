const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

router.put("/:id",          verifyToken, profileController.update);
router.put("/:id/password", verifyToken, profileController.changePassword);
router.delete("/:id",       verifyToken, profileController.remove);

module.exports = router;
