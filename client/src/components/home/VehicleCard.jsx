import { useState } from "react";
import { ArrowRight, Calendar, Fuel, Gauge } from "lucide-react";
import { Link } from "react-router-dom";

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
  switch (status) {
    case "Vendu":
      return "bg-gray-800 text-white";
    case "Réservé":
      return "bg-amber-500 text-white";
    default:
      return "bg-[#e53935] text-white";
  }
}

export default function VehicleCard({ vehicle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const status = vehicle.status || "Disponible";
  const imageSrc = getImageSrc(vehicle.image);

  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(vehicle.price) || 0);

  const formattedMileage = new Intl.NumberFormat("fr-FR").format(
    Number(vehicle.mileage) || 0
  );

  return (
    <Link
      to={`/vehicules/${vehicle.id}`}
      aria-label={`Voir les détails de ${vehicle.brand} ${vehicle.model}`}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e53935]"
    >
      <article className="overflow-hidden rounded-xl bg-white shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <div className="relative h-56 overflow-hidden bg-gray-200">
          {imageSrc && !imageFailed ? (
            <img
              src={imageSrc}
              alt={`${vehicle.brand} ${vehicle.model}`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Photo non disponible
            </div>
          )}

          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(status)}`}
          >
            {status}
          </span>
        </div>

        <div className="p-5">
          <h2 className="mb-2 text-xl font-bold text-[#111111]">
            {vehicle.brand} {vehicle.model}
          </h2>

          <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-4 pt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={15} aria-hidden="true" />
              {vehicle.year}
            </div>

            <div className="flex items-center gap-1">
              <Gauge size={15} aria-hidden="true" />
              {formattedMileage} km
            </div>

            <div className="flex items-center gap-1">
              <Fuel size={15} aria-hidden="true" />
              {vehicle.fuel}
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold text-[#e53935]">
            {formattedPrice}
          </p>

          <span className="mt-4 inline-flex items-center gap-2 font-semibold text-[#111111] transition group-hover:text-[#e53935]">
            Voir les détails
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </article>
    </Link>
  );
}