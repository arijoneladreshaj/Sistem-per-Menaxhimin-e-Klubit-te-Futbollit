const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Token mungon" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token i pavlefshëm ose ka skaduar" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Vetëm admini ka akses" });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
