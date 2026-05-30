const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const favoritesController = require("../controllers/favoritesController");

router.get("/",               verifyToken, favoritesController.getAll);
router.post("/:product_id",   verifyToken, favoritesController.add);
router.delete("/:product_id", verifyToken, favoritesController.remove);

module.exports = router;
