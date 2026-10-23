import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CarFront,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import api from "../services/api";
import { clearAuthToken, getAuthToken } from "../services/authService";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5050/api"
).replace(/\/api\/?$/, "");

const EMPTY_VEHICLE = {
  brand: "",
  model: "",
  year: String(new Date().getFullYear()),
  mileage: "",
  fuel: "Essence",
  transmission: "Manuelle",
  status: "Disponible",
  price: "",
};

const STATUS_OPTIONS = ["Disponible", "Réservé", "Vendu"];
const FUEL_OPTIONS = [
  "Essence",
  "Diesel",
  "Hybride",
  "Hybride rechargeable",
  "Électrique",
  "GPL",
];
const TRANSMISSION_OPTIONS = ["Manuelle", "Automatique"];

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-[#e53935] focus:ring-2 focus:ring-red-100";

function getErrorMessage(error) {
  return (
    error.response?.data?.error ||
    error.response?.data?.message ||
    "Une erreur est survenue. Vérifie le serveur et réessaie."
  );
}

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatMileage(value) {
  return new Intl.NumberFormat("fr-FR").format(Number(value) || 0);
}

function getVehicleImageSrc(image) {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
}

function VehicleForm({
  initialVehicle,
  onSubmit,
  onCancel,
  saving,
  vehicleId,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_VEHICLE,
    ...initialVehicle,
    year: String(initialVehicle?.year ?? EMPTY_VEHICLE.year),
    mileage: String(initialVehicle?.mileage ?? ""),
    price: String(initialVehicle?.price ?? ""),
    status: initialVehicle?.status || "Disponible",
  }));

  const [validationError, setValidationError] = useState("");
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!vehicleId) {
      setImages([]);
      return undefined;
    }

    let cancelled = false;

    async function loadVehicleImages() {
      try {
        const response = await api.get(`/vehicles/${vehicleId}/images`);

        if (!cancelled) {
          setImages(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des images :", error);
        if (!cancelled) {
          setValidationError(getErrorMessage(error));
        }
      }
    }

    loadVehicleImages();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFileSelect(event) {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    const invalidFile = files.find(
      (file) => !allowedTypes.includes(file.type) || file.size > maxSize
    );

    if (invalidFile) {
      setSelectedFiles([]);
      event.target.value = "";

      if (!allowedTypes.includes(invalidFile.type)) {
        setValidationError("Format refusé. Choisis une image JPG, PNG ou WebP.");
      } else {
        setValidationError("Chaque image doit faire 5 Mo maximum.");
      }

      return;
    }

    setValidationError("");
    setSelectedFiles(files);
  }

  async function handleUploadImages() {
    if (selectedFiles.length === 0) return;

    if (!vehicleId) {
      setValidationError(
        "Enregistre d'abord le véhicule avant d'ajouter des images."
      );
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setValidationError(
        "Session administrateur expirée. Reconnecte-toi puis réessaie."
      );
      return;
    }

    setUploadingImages(true);
    setValidationError("");

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("image", file);

        await api.post(`/vehicles/${vehicleId}/images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const response = await api.get(`/vehicles/${vehicleId}/images`);
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setValidationError(getErrorMessage(error));
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleDeleteImage(imageId) {
    if (!window.confirm("Supprimer cette image ?")) return;

    const token = getAuthToken();

    if (!token) {
      setValidationError(
        "Session administrateur expirée. Reconnecte-toi puis réessaie."
      );
      return;
    }

    setDeletingImageId(imageId);
    setValidationError("");

    try {
      await api.delete(`/vehicles/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setImages((current) => current.filter((image) => image.id !== imageId));
    } catch (error) {
      setValidationError(getErrorMessage(error));
    } finally {
      setDeletingImageId(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError("");

    const year = Number(form.year);
    const mileage = Number(form.mileage);
    const price = Number(form.price);

    if (!form.brand.trim() || !form.model.trim()) {
      setValidationError("La marque et le modèle sont obligatoires.");
      return;
    }

    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear() + 1
    ) {
      setValidationError("L'année du véhicule est invalide.");
      return;
    }

    if (!Number.isInteger(mileage) || mileage < 0) {
      setValidationError("Le kilométrage doit être un entier positif.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setValidationError("Le prix doit être supérieur à zéro.");
      return;
    }

    await onSubmit({
      brand: form.brand.trim(),
      model: form.model.trim(),
      year,
      mileage,
      fuel: form.fuel,
      transmission: form.transmission,
      status: form.status,
      price,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">
          Marque *
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className={INPUT_CLASS}
            placeholder="Ex. Renault"
            maxLength={100}
            required
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Modèle *
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            className={INPUT_CLASS}
            placeholder="Ex. Clio"
            maxLength={100}
            required
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Année *
          <input
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear() + 1}
            className={INPUT_CLASS}
            required
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Kilométrage (km) *
          <input
            name="mileage"
            type="number"
            value={form.mileage}
            onChange={handleChange}
            min="0"
            step="1"
            className={INPUT_CLASS}
            required
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Carburant *
          <select
            name="fuel"
            value={form.fuel}
            onChange={handleChange}
            className={INPUT_CLASS}
            required
          >
            {FUEL_OPTIONS.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700">
          Transmission *
          <select
            name="transmission"
            value={form.transmission}
            onChange={handleChange}
            className={INPUT_CLASS}
            required
          >
            {TRANSMISSION_OPTIONS.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700">
          Statut
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={INPUT_CLASS}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700 sm:col-span-2">
          Prix (€) *
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            className={INPUT_CLASS}
            required
          />
        </label>
      </div>

      {vehicleId && (
        <section className="border-t border-gray-200 pt-5">
          <h3 className="mb-4 font-semibold text-gray-900">
            Gestion des images
          </h3>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Ajouter des photos
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={uploadingImages}
                  className={INPUT_CLASS}
                />

                <button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={selectedFiles.length === 0 || uploadingImages}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload size={18} />
                  {uploadingImages ? "Envoi…" : "Envoyer"}
                </button>
              </div>

              <span className="mt-1 block text-xs font-normal text-gray-500">
                Formats JPG, PNG ou WebP. Maximum 5 Mo par image.
              </span>
            </label>
          </div>

          {images.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Photos ({images.length})
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={getVehicleImageSrc(image.image_url)}
                      alt="Photo du véhicule"
                      className="h-32 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deletingImageId === image.id}
                      aria-label="Supprimer cette image"
                      className="absolute right-1 top-1 rounded-lg bg-red-600 p-2 text-white opacity-100 transition hover:bg-red-700 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      {deletingImageId === image.id ? (
                        <span className="text-xs">…</span>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <ImageIcon
                size={24}
                className="mx-auto mb-2 text-gray-400"
                aria-hidden="true"
              />
              <p className="text-sm text-gray-500">
                Aucune photo pour ce véhicule.
              </p>
            </div>
          )}
        </section>
      )}

      {validationError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {validationError}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving || uploadingImages}
          className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={saving || uploadingImages}
          className="rounded-lg bg-[#e53935] px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export default function AdminVehiclesPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/vehicles");
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  function handleLogout() {
    clearAuthToken();
    navigate("/admin/login", { replace: true });
  }

  function openCreateModal() {
    setEditingVehicle(null);
    setPageError("");
    setSuccessMessage("");
    setModalOpen(true);
  }

  function openEditModal(vehicle) {
    setEditingVehicle(vehicle);
    setPageError("");
    setSuccessMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingVehicle(null);
  }

  async function handleSaveVehicle(vehicleData) {
    setSaving(true);
    setPageError("");
    setSuccessMessage("");

    try {
      const token = getAuthToken();

      if (!token) {
        setPageError(
          "Session administrateur introuvable. Reconnecte-toi puis réessaie."
        );
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingVehicle) {
        await api.put(
          `/vehicles/${editingVehicle.id}`,
          vehicleData,
          config
        );

        setModalOpen(false);
        setEditingVehicle(null);
        setSuccessMessage("Le véhicule a été modifié avec succès.");
        await loadVehicles();
      } else {
        const response = await api.post("/vehicles", vehicleData, config);
        setEditingVehicle(response.data);
        setSuccessMessage(
          "Le véhicule a été ajouté. Tu peux maintenant ajouter des photos."
        );
      }
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVehicle(vehicle) {
    const confirmed = window.confirm(
      `Confirmer la suppression de ${vehicle.brand} ${vehicle.model} ? Cette action est définitive.`
    );

    if (!confirmed) return;

    const token = getAuthToken();

    if (!token) {
      setPageError(
        "Session administrateur introuvable. Reconnecte-toi puis réessaie."
      );
      return;
    }

    setDeletingId(vehicle.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await api.delete(`/vehicles/${vehicle.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVehicles((current) =>
        current.filter((item) => item.id !== vehicle.id)
      );
      setSuccessMessage("Le véhicule a été supprimé.");
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");

    return vehicles
      .filter((vehicle) => {
        const searchableText =
          `${vehicle.brand} ${vehicle.model} ${vehicle.year}`.toLocaleLowerCase(
            "fr"
          );

        const matchesSearch = searchableText.includes(normalizedSearch);
        const matchesStatus =
          !statusFilter || (vehicle.status || "Disponible") === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return Number(a.price) - Number(b.price);
          case "price-desc":
            return Number(b.price) - Number(a.price);
          case "year-desc":
            return Number(b.year) - Number(a.year);
          case "brand-asc":
            return String(a.brand).localeCompare(String(b.brand), "fr");
          default:
            return 0;
        }
      });
  }, [vehicles, search, statusFilter, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#e53935]"
            >
              <ArrowLeft size={16} />
              Retour au site
            </Link>

            <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">
              Administration des véhicules
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Gérez le stock de Garage Millésime Auto.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/vehicules"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 hover:border-[#e53935] hover:text-[#e53935]"
            >
              Voir le catalogue
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-[#111111] px-4 py-2.5 font-semibold text-white hover:bg-gray-800"
            >
              Se déconnecter
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-3 text-[#e53935]">
                <CarFront size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Véhicules en catalogue</p>
                <p className="text-2xl font-bold text-[#111111]">
                  {loading ? "…" : vehicles.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-3 text-gray-700">
                <Search size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Résultats affichés</p>
                <p className="text-2xl font-bold text-[#111111]">
                  {loading ? "…" : filteredVehicles.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {pageError && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{pageError}</p>
            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Fermer le message d'erreur"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {successMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">
                Gestion du stock
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Ajoute, modifie ou supprime les véhicules.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher..."
                  aria-label="Rechercher un véhicule"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-[#e53935] sm:w-56"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filtrer par statut"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-[#e53935]"
              >
                <option value="">Tous les statuts</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Trier les véhicules"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-[#e53935]"
              >
                <option value="">Tri par défaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="year-desc">Année récente</option>
                <option value="brand-asc">Marque A–Z</option>
              </select>

              <button
                type="button"
                onClick={loadVehicles}
                disabled={loading}
                title="Actualiser la liste"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={17} />
                Actualiser
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e53935] px-4 py-2.5 font-semibold text-white hover:bg-red-700"
              >
                <Plus size={18} />
                Ajouter un véhicule
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500" role="status">
              Chargement des véhicules…
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <CarFront
                size={40}
                className="mx-auto mb-3 text-gray-300"
                aria-hidden="true"
              />
              <p className="font-semibold text-gray-800">
                {vehicles.length === 0
                  ? "Aucun véhicule enregistré."
                  : "Aucun véhicule ne correspond à la recherche."}
              </p>

              {vehicles.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Utilise « Ajouter un véhicule » pour créer ta première fiche.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Véhicule</th>
                    <th className="px-5 py-4">Année</th>
                    <th className="px-5 py-4">Kilométrage</th>
                    <th className="px-5 py-4">Carburant</th>
                    <th className="px-5 py-4">Statut</th>
                    <th className="px-5 py-4">Prix</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
                            {vehicle.image ? (
                              <img
                                src={getVehicleImageSrc(vehicle.image)}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <CarFront size={24} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {vehicle.brand} {vehicle.model}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {vehicle.transmission ||
                                "Transmission non précisée"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {vehicle.year}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {formatMileage(vehicle.mileage)} km
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {vehicle.fuel}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            vehicle.status === "Vendu"
                              ? "bg-red-100 text-red-700"
                              : vehicle.status === "Réservé"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {vehicle.status || "Disponible"}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-[#e53935]">
                        {formatPrice(vehicle.price)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(vehicle)}
                            aria-label={`Modifier ${vehicle.brand} ${vehicle.model}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:border-[#e53935] hover:text-[#e53935]"
                          >
                            <Pencil size={15} />
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(vehicle)}
                            disabled={deletingId === vehicle.id}
                            aria-label={`Supprimer ${vehicle.brand} ${vehicle.model}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            {deletingId === vehicle.id
                              ? "Suppression…"
                              : "Supprimer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Les changements sont enregistrés dans la base de données par l'API.
          Assure-toi que les routes d'écriture sont protégées côté serveur.
        </p>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-form-title"
            className="my-auto w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="vehicle-form-title"
                  className="text-xl font-bold text-[#111111]"
                >
                  {editingVehicle
                    ? "Modifier le véhicule"
                    : "Ajouter un véhicule"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Les champs marqués d'un astérisque sont obligatoires.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fermer le formulaire"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <VehicleForm
              key={editingVehicle?.id ?? "new-vehicle"}
              initialVehicle={editingVehicle}
              onSubmit={handleSaveVehicle}
              onCancel={closeModal}
              saving={saving}
              vehicleId={editingVehicle?.id}
            />
          </section>
        </div>
      )}
    </main>
  );
}