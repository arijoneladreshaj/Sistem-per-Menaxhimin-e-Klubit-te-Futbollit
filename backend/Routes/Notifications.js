const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const notificationsController = require("../controllers/notificationsController");

router.get("/my",           verifyToken, notificationsController.getMy);
router.get("/unread-count", verifyToken, notificationsController.getUnreadCount);
router.put("/:id/read",     verifyToken, notificationsController.markRead);
router.put("/read-all",     verifyToken, notificationsController.markAllRead);

module.exports = router;
