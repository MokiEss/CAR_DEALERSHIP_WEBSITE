
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const requireAdmin = require("../middleware/auth");
const { rateLimit } = require("express-rate-limit");
const router = express.Router();

router.get("/verify", requireAdmin, (req, res) => {
  return res.json({ authenticated: true });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message:
    "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        error: "Identifiant et mot de passe obligatoires.",
      });
    }

    const validUsername = username === process.env.ADMIN_USERNAME;
    const validPassword = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH || ""
    );

    if (!validUsername || !validPassword) {
      return res.status(401).json({
        error: "Identifiants incorrects.",
      });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, expiresIn: 3600 });
  } catch (error) {
    console.error("Erreur de connexion administrateur :", error);

    return res.status(500).json({
      error: "Erreur lors de la connexion.",
    });
  }
});

module.exports = router;