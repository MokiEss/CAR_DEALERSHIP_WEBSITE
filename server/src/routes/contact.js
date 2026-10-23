const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Trop de demandes. Réessaie dans quelques minutes.",
  },
});

router.post("/", contactLimiter, async (req, res) => {
  const { name, email, phone = "", message } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof message !== "string"
  ) {
    return res.status(400).json({ error: "Données de formulaire invalides." });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanPhone = phone.trim();
  const cleanMessage = message.trim();

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  if (
    !cleanName ||
    cleanName.length > 100 ||
    !validEmail ||
    cleanEmail.length > 254 ||
    cleanPhone.length > 30 ||
    !cleanMessage ||
    cleanMessage.length > 5000
  ) {
    return res.status(400).json({
      error: "Vérifie les champs et réessaie.",
    });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
    return res.status(503).json({
      error: "Le service de contact n'est pas configuré.",
    });
  }

  try {
    const port = Number(SMTP_PORT);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_USER,
      to: CONTACT_TO,
      replyTo: cleanEmail,
      subject: `Message du formulaire — ${cleanName.replace(/[\r\n]/g, " ")}`,
      text: [
        `Nom : ${cleanName}`,
        `Email : ${cleanEmail}`,
        `Téléphone : ${cleanPhone || "Non renseigné"}`,
        "",
        "Message :",
        cleanMessage,
      ].join("\n"),
    });

    return res.status(200).json({
      message: "Votre message a bien été envoyé.",
    });
  } catch (error) {
    console.error("Échec de l'envoi du formulaire de contact :", error.message);

    return res.status(500).json({
      error: "L'envoi du message a échoué. Réessaie plus tard.",
    });
  }
});

module.exports = router;