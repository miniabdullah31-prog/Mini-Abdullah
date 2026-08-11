const jwt = require("jsonwebtoken");

/**
 * Verify JWT from Authorization: Bearer <token> and attach req.user.
 */
function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;

    if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = header.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET missing — cannot verify tokens");
      return res.status(500).json({
        success: false,
        message: "Server auth not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  } catch (_err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;
