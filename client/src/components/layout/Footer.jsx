export default function Footer() {
  return (
    <footer className="bg-gray-900 py-10 text-white">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-xl font-bold">
          Garage Millésime Auto - Motrio
        </h2>

        <p className="mt-3 text-gray-400">
          Vente de véhicules • Entretien • Réparation
        </p>

        <p className="mt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Garage Millésime Auto.
          Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}