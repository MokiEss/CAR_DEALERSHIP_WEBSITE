import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import VehicleCard from "../components/home/VehicleCard";
import { getVehicles } from "../services/vehicleService";

const STATUS_OPTIONS = ["Disponible", "Réservé", "Vendu"];
const PAGE_SIZE = 9;


function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function fetchVehicles() {
      try {
        const data = await getVehicles();

        if (!cancelled) {
          setVehicles(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        console.error("Erreur de chargement des véhicules :", err);

        if (!cancelled) {
          setError(
            "Impossible de récupérer les véhicules. Veuillez réessayer."
          );
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

  const fuelOptions = useMemo(
    () =>
      [...new Set(vehicles.map((vehicle) => vehicle.fuel).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "fr")
      ),
    [vehicles]
  );

  const transmissionOptions = useMemo(
    () =>
      [
        ...new Set(
          vehicles.map((vehicle) => vehicle.transmission).filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b, "fr")),
    [vehicles]
  );

  const filteredVehicles = useMemo(() => {
    const query = normalizeText(search);

    const result = vehicles.filter((vehicle) => {
      const searchableText = normalizeText(
        `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
      );

      const matchesSearch = searchableText.includes(query);
      const matchesFuel = !fuel || vehicle.fuel === fuel;
      const matchesTransmission =
        !transmission || vehicle.transmission === transmission;
      const matchesStatus =
        !status || (vehicle.status || "Disponible") === status;

      const price = Number(vehicle.price);
      const matchesMinPrice =
        minPrice === "" || price >= Number(minPrice);
      const matchesMaxPrice =
        maxPrice === "" || price <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesFuel &&
        matchesTransmission &&
        matchesStatus &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "year-desc":
          return Number(b.year) - Number(a.year);
        case "mileage-asc":
          return Number(a.mileage) - Number(b.mileage);
        default:
          return 0;
      }
    });

    return result;
  }, [
    vehicles,
    search,
    fuel,
    transmission,
    status,
    minPrice,
    maxPrice,
    sortBy,
  ]);
  const totalPages = Math.max(
  1,
  Math.ceil(filteredVehicles.length / PAGE_SIZE)
);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredVehicles.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredVehicles, currentPage]);

  useEffect(() => {
  setCurrentPage(1);
}, [search, fuel, transmission, status, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  function resetFilters() {
    setSearch("");
    setFuel("");
    setTransmission("");
    setStatus("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("price-asc");
  }

  const hasActiveFilters =
    search !== "" ||
    fuel !== "" ||
    transmission !== "" ||
    status !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sortBy !== "price-asc";

  return (
    <MainLayout>
      <section className="min-h-[60vh] bg-gray-50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10">
            <p className="mb-3 font-semibold uppercase tracking-widest text-[#e53935]">
              Notre stock
            </p>

            <h1 className="text-4xl font-bold text-[#111111] md:text-5xl">
              Nos véhicules
            </h1>

            <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">
              Trouvez le véhicule qui vous correspond grâce à nos outils de
              recherche et de filtrage.
            </p>
          </header>

          <section
            aria-labelledby="vehicle-filters-title"
            className="mb-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7"
          >
            <div className="mb-6 flex items-center gap-3">
              <SlidersHorizontal
                size={22}
                className="text-[#e53935]"
                aria-hidden="true"
              />
              <h2
                id="vehicle-filters-title"
                className="text-xl font-bold text-[#111111]"
              >
                Rechercher un véhicule
              </h2>
            </div>

            <div className="mb-6">
              <label
                htmlFor="vehicle-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Marque ou modèle
              </label>

              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="vehicle-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ex. Renault, Clio, Peugeot..."
                  className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="vehicle-fuel"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Carburant
                </label>
                <select
                  id="vehicle-fuel"
                  value={fuel}
                  onChange={(event) => setFuel(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Tous les carburants</option>
                  {fuelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="vehicle-transmission"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Boîte de vitesses
                </label>
                <select
                  id="vehicle-transmission"
                  value={transmission}
                  onChange={(event) => setTransmission(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Toutes les boîtes</option>
                  {transmissionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="vehicle-status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Disponibilité
                </label>
                <select
                  id="vehicle-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Tous les statuts</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="vehicle-sort"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Trier par
                </label>
                <select
                  id="vehicle-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
                >
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="year-desc">Année, plus récente</option>
                  <option value="mileage-asc">Kilométrage croissant</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="vehicle-min-price"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Prix minimum (€)
                </label>
                <input
                  id="vehicle-min-price"
                  type="number"
                  min="0"
                  step="100"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Sans minimum"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label
                  htmlFor="vehicle-max-price"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Prix maximum (€)
                </label>
                <input
                  id="vehicle-max-price"
                  type="number"
                  min="0"
                  step="100"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Sans maximum"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-600">
                Les résultats se mettent à jour automatiquement.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition hover:border-[#e53935] hover:text-[#e53935] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={17} aria-hidden="true" />
                Réinitialiser
              </button>
            </div>
          </section>

          {loading && (
            <p className="py-12 text-center text-gray-500" role="status">
              Chargement des véhicules…
            </p>
          )}

          {!loading && error && (
            <div className="py-12 text-center">
              <p role="alert" className="text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-md bg-[#111111] px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#111111]">
                  {filteredVehicles.length} véhicule
                  {filteredVehicles.length !== 1 ? "s" : ""} trouvé
                  {filteredVehicles.length !== 1 ? "s" : ""}
                </h2>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-semibold text-[#e53935] hover:underline"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-md bg-[#111111] px-4 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Précédent
                  </button>

                  <span className="text-sm font-medium text-[#111111]">
                    {currentPage} sur {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-md bg-[#111111] px-4 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              )}

              {filteredVehicles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                  <Search
                    size={36}
                    className="mx-auto mb-4 text-gray-400"
                    aria-hidden="true"
                  />

                  <h3 className="text-xl font-bold text-[#111111]">
                    Aucun véhicule trouvé
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Essayez de modifier vos critères de recherche.
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 rounded-md bg-[#e53935] px-6 py-3 font-semibold text-white transition hover:bg-[#c62828]"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}