const express = require("express");
const pool = require("../db");
const fs = require("fs/promises");
const path = require("path");
const requireAdmin = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();
const uploadsDir = path.join(__dirname, "../../public/uploads");

async function removeUploadedImage(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) {
    return;
  }

  const filename = path.basename(imageUrl);

  if (!filename || filename === "." || filename === "..") {
    return;
  }

  try {
    await fs.unlink(path.join(uploadsDir, filename));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Échec de suppression d'une image uploadée :", error.code);
    }
  }
}

async function hasAllowedImageSignature(filePath) {
  const fileHandle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await fileHandle.read(buffer, 0, buffer.length, 0);

    const isJpeg =
      bytesRead >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    const isPng =
      bytesRead >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );

    const isWebp =
      bytesRead >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    return isJpeg || isPng || isWebp;
  } finally {
    await fileHandle.close();
  }
}

const VALID_VEHICLE_STATUSES = ["Disponible", "Réservé", "Vendu"];
const VALID_FUELS = [
  "Essence",
  "Diesel",
  "Hybride",
  "Hybride rechargeable",
  "Électrique",
  "GPL",
];
const VALID_TRANSMISSIONS = ["Manuelle", "Automatique"];

function normalizeVehiclePayload(body = {}) {
  return {
    brand: typeof body.brand === "string" ? body.brand.trim() : "",
    model: typeof body.model === "string" ? body.model.trim() : "",
    year: Number(body.year),
    mileage: Number(body.mileage),
    fuel: typeof body.fuel === "string" ? body.fuel.trim() : "",
    transmission:
      typeof body.transmission === "string" ? body.transmission.trim() : "",
    status:
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "Disponible",
    price: Number(body.price),
    image: typeof body.image === "string" ? body.image.trim() : "",
  };
}

function validateVehiclePayload(payload) {
  const errors = [];
  const maximumYear = new Date().getFullYear() + 1;

  if (!payload.brand) {
    errors.push("La marque est obligatoire.");
  } else if (payload.brand.length > 100) {
    errors.push("La marque ne peut pas dépasser 100 caractères.");
  }

  if (!payload.model) {
    errors.push("Le modèle est obligatoire.");
  } else if (payload.model.length > 100) {
    errors.push("Le modèle ne peut pas dépasser 100 caractères.");
  }

  if (
    !Number.isInteger(payload.year) ||
    payload.year < 1900 ||
    payload.year > maximumYear
  ) {
    errors.push(`L'année doit être comprise entre 1900 et ${maximumYear}.`);
  }

  if (!Number.isInteger(payload.mileage) || payload.mileage < 0) {
    errors.push("Le kilométrage doit être un entier positif ou nul.");
  }

  if (!VALID_FUELS.includes(payload.fuel)) {
    errors.push("Le carburant sélectionné est invalide.");
  }

  if (!VALID_TRANSMISSIONS.includes(payload.transmission)) {
    errors.push("La transmission sélectionnée est invalide.");
  }

  if (!VALID_VEHICLE_STATUSES.includes(payload.status)) {
    errors.push("Le statut doit être Disponible, Réservé ou Vendu.");
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    errors.push("Le prix doit être supérieur à zéro.");
  }

  return errors;
}

// Public: liste des véhicules
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
    v.id,
    v.brand,
    v.model,
    v.year,
    v.mileage,
    v.fuel,
    v.transmission,
    v.status,
    v.price,
    COALESCE(
      (
        SELECT vi.image_url
        FROM vehicle_images vi
        WHERE vi.vehicle_id = v.id
        ORDER BY vi.created_at ASC, vi.id ASC
        LIMIT 1
      ),
      v.image
    ) AS image
  FROM vehicles v
  ORDER BY v.created_at DESC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vehicles:", error);

    return res.status(500).json({
      error: "Impossible de récupérer les véhicules.",
    });
  }
});

// Public: détail d'un véhicule
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        brand,
        model,
        year,
        mileage,
        fuel,
        transmission,
        status,
        price,
        image
      FROM vehicles
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Véhicule introuvable.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching vehicle:", error);

    return res.status(500).json({
      error: "Impossible de récupérer le véhicule.",
    });
  }
});

// Admin: création
router.post("/", requireAdmin, async (req, res) => {
  try {
    const payload = normalizeVehiclePayload(req.body);
    const errors = validateVehiclePayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ error: "Données invalides.", details: errors });
    }

    const result = await pool.query(
      `
      INSERT INTO vehicles (
        brand,
        model,
        year,
        mileage,
        fuel,
        transmission,
        status,
        price,
        image
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, brand, model, year, mileage, fuel, transmission, status, price, image
      `,
      [
        payload.brand,
        payload.model,
        payload.year,
        payload.mileage,
        payload.fuel,
        payload.transmission,
        payload.status,
        payload.price,
        payload.image || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating vehicle:", error);

    return res.status(500).json({
      error: "Impossible de créer le véhicule.",
    });
  }
});

// Admin: modification
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const payload = normalizeVehiclePayload(req.body);
    const errors = validateVehiclePayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ error: "Données invalides.", details: errors });
    }

    const result = await pool.query(
      `
      UPDATE vehicles
      SET brand = $1,
          model = $2,
          year = $3,
          mileage = $4,
          fuel = $5,
          transmission = $6,
          status = $7,
          price = $8,
          image = $9
      WHERE id = $10
      RETURNING id, brand, model, year, mileage, fuel, transmission, status, price, image
      `,
      [
        payload.brand,
        payload.model,
        payload.year,
        payload.mileage,
        payload.fuel,
        payload.transmission,
        payload.status,
        payload.price,
        payload.image || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Véhicule introuvable." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating vehicle:", error);

    return res.status(500).json({
      error: "Impossible de modifier le véhicule.",
    });
  }
});

// Admin: suppression
router.delete("/:id", requireAdmin, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const vehicleResult = await client.query(
      "SELECT id, image FROM vehicles WHERE id = $1",
      [id]
    );

    if (vehicleResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Véhicule introuvable." });
    }

    const imagesResult = await client.query(
      "SELECT image_url FROM vehicle_images WHERE vehicle_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM vehicle_images WHERE vehicle_id = $1",
      [id]
    );

    await client.query("DELETE FROM vehicles WHERE id = $1", [id]);
    await client.query("COMMIT");

    const imageUrls = [
      vehicleResult.rows[0].image,
      ...imagesResult.rows.map((image) => image.image_url),
    ];

    await Promise.all(imageUrls.map(removeUploadedImage));

    return res.status(204).send();
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Error deleting vehicle:", error);

    return res.status(500).json({
      error: "Impossible de supprimer le véhicule.",
    });
  } finally {
    client.release();
  }
});

// Admin: récupère les images d'un véhicule
router.get("/:vehicleId/images", async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const result = await pool.query(
      `SELECT id, image_url FROM vehicle_images WHERE vehicle_id = $1 ORDER BY created_at ASC`,
      [vehicleId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: "Impossible de récupérer les images." });
  }
});

// Admin: upload une image
router.post(
  "/:vehicleId/images",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const uploadedFileUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni." });
      }
      
      const validImage = await hasAllowedImageSignature(req.file.path);

      if (!validImage) {
        await removeUploadedImage(uploadedFileUrl);
        return res.status(400).json({
          error: "Le fichier doit être une véritable image JPG, PNG ou WebP.",
        });
      }
      const { vehicleId } = req.params;
      const vehicleCheck = await pool.query(
        "SELECT id FROM vehicles WHERE id = $1",
        [vehicleId]
      );

      if (vehicleCheck.rows.length === 0) {
        await removeUploadedImage(uploadedFileUrl);
        return res.status(404).json({ error: "Véhicule introuvable." });
      }

      const result = await pool.query(
        `INSERT INTO vehicle_images (vehicle_id, image_url)
         VALUES ($1, $2)
         RETURNING id, image_url`,
        [vehicleId, uploadedFileUrl]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      if (uploadedFileUrl) {
        await removeUploadedImage(uploadedFileUrl);
      }

      console.error("Error uploading image:", error.code || error.message);

      return res.status(500).json({
        error: "Impossible d'ajouter l'image.",
      });
    }
  }
);

// Admin: supprimer une image
router.delete("/images/:imageId", requireAdmin, async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await pool.query(
      "DELETE FROM vehicle_images WHERE id = $1 RETURNING id, image_url",
      [imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image introuvable." });
    }

    await removeUploadedImage(result.rows[0].image_url);

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);

    return res.status(500).json({
      error: "Impossible de supprimer l'image.",
    });
  }
});

module.exports = router;