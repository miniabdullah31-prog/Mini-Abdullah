const jwt = require("jsonwebtoken");
const { ACCESS_TYP, accessSecret } = require("../services/tokenService");

/**
 * Verify access JWT from Authorization: Bearer <token> and attach req.user.
 * Refresh tokens (typ=refresh) are rejected.
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

    const secret = accessSecret();
    if (!secret) {
      console.log("JWT_SECRET missing — cannot verify tokens");
      return res.status(500).json({
        success: false,
        message: "Server auth not configured",
      });
    }

    const decoded = jwt.verify(token, secret);

    if (decoded.typ === "refresh") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // typ missing = legacy access tokens issued before refresh-token rollout
    if (decoded.typ && decoded.typ !== ACCESS_TYP) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  } catch (_err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "TOKEN_EXPIRED",
    });
  }
}

module.exports = authMiddleware;
