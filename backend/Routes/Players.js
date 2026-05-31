const express  = require("express");
const router   = express.Router();
const path     = require("path");
const multer   = require("multer");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const playersController = require("../controllers/playersController");

const TRAJNER_ROLES = ["Admin", "Trajner"];
const UPLOAD_DIR    = path.join(__dirname, "../../public/players");

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:    (_, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `upload-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Vetëm imazhe lejohen"));
  },
});

router.get("/",     verifyToken,                                                          playersController.getAll);
router.get("/:id",     verifyToken,                                                       playersController.getOne);
router.post("/",          verifyToken, requireRole(...TRAJNER_ROLES),        playersController.create);
router.put("/:id",        verifyToken, requireRole(...TRAJNER_ROLES),        playersController.update);
router.post("/:id/photo", verifyToken, requireRole(...TRAJNER_ROLES), upload.single("foto"), playersController.uploadPhoto);
router.delete("/:id/photo", verifyToken, requireRole(...TRAJNER_ROLES),      playersController.deletePhoto);
router.delete("/:id",     verifyToken, requireRole(...TRAJNER_ROLES),        playersController.remove);

module.exports = router;
