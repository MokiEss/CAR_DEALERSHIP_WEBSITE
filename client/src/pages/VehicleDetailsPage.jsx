import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Phone,
  Settings2,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import { getVehicleById } from "../services/vehicleService";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5050/api"
).replace(/\/api\/?$/, "");

function getImageSrc(image) {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
}

function getStatusClass(status) {
  if (status === "Vendu") return "bg-gray-800 text-white";
  if (status === "Réservé") return "bg-amber-500 text-white";
  return "bg-[#e53935] text-white";
}

export default function VehicleDetailsPage() {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchVehicle() {
      setLoading(true);
      setError("");
      setVehicle(null);
      setImages([]);
      setCurrentImageIndex(0);

      try {
        const data = await getVehicleById(id);

        if (cancelled) return;

        setVehicle(data);

        try {
          const imagesResponse = await api.get(`/vehicles/${id}/images`);

          if (!cancelled) {
            setImages(
              Array.isArray(imagesResponse.data) ? imagesResponse.data : []
            );
          }
        } catch (imageError) {
          console.error(
            "Erreur lors du chargement des images :",
            imageError
          );
        }
      } catch (fetchError) {
        console.error(
          "Erreur lors du chargement du véhicule :",
          fetchError
        );

        if (!cancelled) {
          setError(
            fetchError.response?.status === 404
              ? "Véhicule introuvable."
              : "Impossible de charger ce véhicule. Veuillez réessayer."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchVehicle();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const formatMileage = (mileage) =>
    new Intl.NumberFormat("fr-FR").format(Number(mileage) || 0);

  const galleryImages =
    images.length > 0
      ? images
      : vehicle?.image
        ? [{ image_url: vehicle.image }]
        : [];

  const vehicleStatus = vehicle?.status || "Disponible";

  function goToPreviousImage() {
    setCurrentImageIndex((previous) =>
      previous === 0 ? galleryImages.length - 1 : previous - 1
    );
  }

  function goToNextImage() {
    setCurrentImageIndex((previous) =>
      previous === galleryImages.length - 1 ? 0 : previous + 1
    );
  }

  return (
    <MainLayout>
      <section className="min-h-[60vh] bg-gray-50 px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/vehicules"
            className="mb-8 inline-flex items-center gap-2 font-semibold text-gray-600 transition hover:text-[#e53935]"
          >
            <ArrowLeft size={18} />
            Retour aux véhicules
          </Link>

          {loading && (
            <p className="py-20 text-center text-gray-500" role="status">
              Chargement de la fiche du véhicule…
            </p>
          )}

          {!loading && error && (
            <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-[#111111]">{error}</h1>

              <p className="mt-3 text-gray-600">
                Vérifiez l’adresse ou retournez au catalogue.
              </p>

              <Link
                to="/vehicules"
                className="mt-6 inline-flex rounded-md bg-[#e53935] px-6 py-3 font-semibold text-white transition hover:bg-[#c62828]"
              >
                Voir nos véhicules
              </Link>
            </div>
          )}

          {!loading && !error && vehicle && (
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl bg-white shadow-md">
                {galleryImages.length > 0 ? (
                  <div className="relative">
                    <img
                      src={getImageSrc(
                        galleryImages[currentImageIndex]?.image_url
                      )}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="h-72 w-full object-cover md:h-[460px]"
                    />

                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goToPreviousImage}
                          aria-label="Photo précédente"
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                          <ChevronLeft size={24} />
                        </button>

                        <button
                          type="button"
                          onClick={goToNextImage}
                          aria-label="Photo suivante"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                          <ChevronRight size={24} />
                        </button>

                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                          {galleryImages.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCurrentImageIndex(index)}
                              aria-label={`Afficher la photo ${index + 1}`}
                              aria-current={index === currentImageIndex}
                              className={`h-2 rounded-full transition ${
                                index === currentImageIndex
                                  ? "w-6 bg-white"
                                  : "w-2 bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex h-72 items-center justify-center bg-gray-200 text-gray-500 md:h-[460px]">
                    Photo non disponible
                  </div>
                )}
              </div>

              <div>
                <p className="font-semibold uppercase tracking-widest text-[#e53935]">
                  Garage Millésime Auto - Motrio
                </p>

                <h1 className="mt-3 text-4xl font-bold text-[#111111] md:text-5xl">
                  {vehicle.brand} {vehicle.model}
                </h1>

                <span
                  className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                    vehicleStatus
                  )}`}
                >
                  {vehicleStatus}
                </span>

                <p className="mt-5 text-3xl font-bold text-[#e53935]">
                  {formatPrice(vehicle.price)}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                    <Calendar className="text-[#e53935]" size={22} />
                    <div>
                      <p className="text-sm text-gray-500">Année</p>
                      <p className="font-semibold">{vehicle.year}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                    <Gauge className="text-[#e53935]" size={22} />
                    <div>
                      <p className="text-sm text-gray-500">Kilométrage</p>
                      <p className="font-semibold">
                        {formatMileage(vehicle.mileage)} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                    <Fuel className="text-[#e53935]" size={22} />
                    <div>
                      <p className="text-sm text-gray-500">Carburant</p>
                      <p className="font-semibold">{vehicle.fuel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                    <Settings2 className="text-[#e53935]" size={22} />
                    <div>
                      <p className="text-sm text-gray-500">Boîte de vitesses</p>
                      <p className="font-semibold">{vehicle.transmission}</p>
                    </div>
                  </div>
                </div>

                {vehicleStatus === "Vendu" ? (
                  <div
                    role="status"
                    className="mt-8 rounded-lg border border-gray-200 bg-white p-5"
                  >
                    <p className="font-semibold text-gray-900">
                      Ce véhicule a été vendu.
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Consultez notre catalogue pour découvrir les véhicules
                      disponibles.
                    </p>
                    <Link
                      to="/vehicules"
                      className="mt-4 inline-flex rounded-md bg-[#e53935] px-6 py-3 font-semibold text-white transition hover:bg-[#c62828]"
                    >
                      Voir les véhicules
                    </Link>
                  </div>
                ) : (
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <a
                      href="tel:+33389574612"
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e53935] px-6 py-4 font-semibold text-white transition hover:bg-[#c62828]"
                    >
                      <Phone size={19} />
                      {vehicleStatus === "Réservé"
                        ? "Se renseigner sur ce véhicule"
                        : "Contacter le garage"}
                    </a>

                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center rounded-md border border-[#111111] px-6 py-4 font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white"
                    >
                      Nous écrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}