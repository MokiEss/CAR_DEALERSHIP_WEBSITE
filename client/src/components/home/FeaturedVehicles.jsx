
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import VehicleCard from "./VehicleCard";
import { getVehicles } from "../../services/vehicleService";

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchVehicles() {
      try {
        const data = await getVehicles();

        if (!cancelled) {
          setVehicles(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Erreur lors du chargement des véhicules :", err);

        if (!cancelled) {
          setError("Impossible de charger les véhicules pour le moment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 font-semibold uppercase tracking-wider text-[#e53935]">
              Notre sélection
            </p>

            <h2 className="text-4xl font-bold text-[#111111]">
              Nos véhicules à la une
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Découvrez une sélection de véhicules d'occasion soigneusement
              sélectionnés par notre équipe.
            </p>
          </div>

          <Link
            to="/vehicules"
            className="inline-flex items-center gap-2 font-semibold text-[#e53935] transition hover:gap-3"
          >
            Voir tous les véhicules
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading && (
          <p className="py-10 text-center text-gray-500">
            Chargement des véhicules...
          </p>
        )}

        {!loading && error && (
          <p role="alert" className="py-10 text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            Aucun véhicule disponible pour le moment.
          </p>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}