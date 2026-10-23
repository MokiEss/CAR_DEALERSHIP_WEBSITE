import { ArrowRight, Check, Phone, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/images/backgr.png";
const projectPoints = [
  "Véhicules de moins de 3 ans",
  "Informations sur les démarches liées au CCR",
  "Échange personnalisé sur votre projet",
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#111111] text-white">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/75 to-black/45"
        aria-hidden="true"
      />

      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white">
            <span className="h-2 w-2 rounded-full bg-[#e53935]" />
            Garage Millésime Auto · Mulhouse
          </p>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Votre projet automobile
            <span className="mt-2 block text-[#f04440]">
              entre la France et l’Algérie
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-200 md:text-xl">
            Découvrez notre sélection de véhicules d’occasion et échangez avec
            notre équipe sur votre projet d’exportation vers l’Algérie.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/vehicules"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e53935] px-6 py-3.5 font-semibold text-white transition hover:bg-[#c62828] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Découvrir nos véhicules
              <ArrowRight size={19} aria-hidden="true" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/70 bg-black/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white hover:text-[#111111] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Phone size={18} aria-hidden="true" />
              Parler de mon projet
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/15 bg-[#111111]/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e53935]/15 text-[#f04440]">
            <Plane size={25} aria-hidden="true" />
          </div>

          <h2 className="text-2xl font-bold sm:text-3xl">
            Vous envisagez un export vers l’Algérie ?
          </h2>

          <p className="mt-3 leading-relaxed text-gray-300">
            Nous pouvons échanger avec vous sur les véhicules de moins de trois
            ans et les démarches liées au CCR (certificat de changement de
            résidence).
          </p>

          <ul className="mt-6 space-y-3">
            {projectPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-gray-200">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-[#f04440]"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-white/15 pt-4 text-xs leading-relaxed text-gray-400">
            Les règles d’importation et les conditions d’éligibilité peuvent
            évoluer et dépendent de votre situation. Vérifiez-les auprès des
            autorités compétentes.
          </p>
        </aside>
      </div>
    </section>
  );
}