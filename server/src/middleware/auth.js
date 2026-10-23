const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentification requise.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      error: "Authentification indisponible.",
    });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({
        error: "Accès interdit.",
      });
    }

    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({
      error: "Session invalide ou expirée.",
    });
  }
}

module.exports = requireAdmin;