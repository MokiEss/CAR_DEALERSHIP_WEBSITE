require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const contactRoutes = require("./routes/contact");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares généraux
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Servir les images uploadées depuis server/public/uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../public/uploads"))
);

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Route de vérification du serveur
app.get("/", (req, res) => {
  res.json({ message: "Garage Millésime Auto API fonctionne." });
});

// Gestion des erreurs (notamment Multer)
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: `Erreur upload : ${err.message}`,
    });
  }

  if (err.message?.includes("Format d'image invalide")) {
    return res.status(400).json({
      error: err.message,
    });
  }

  console.error("Erreur serveur :", err);

  return res.status(500).json({
    error: "Une erreur interne est survenue sur le serveur.",
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});