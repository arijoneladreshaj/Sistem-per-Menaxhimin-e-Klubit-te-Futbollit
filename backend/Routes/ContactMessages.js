const express = require("express");
const router  = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const contactMessagesController = require("../controllers/contactMessagesController");

router.post("/",   verifyToken,         contactMessagesController.create);
router.get("/",            verifyToken, requireAdmin, contactMessagesController.getAll);
router.put("/:id/lexuar",  verifyToken, requireAdmin, contactMessagesController.markRead);
router.delete("/:id",      verifyToken, requireAdmin, contactMessagesController.remove);

module.exports = router;
