import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AlgeriaImportSection() {
  return (
    <section className="bg-[#111111] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 font-semibold uppercase tracking-widest text-[#e53935]">
          Un projet vers l’Algérie ?
        </p>

        <h2 className="max-w-3xl text-3xl font-bold md:text-4xl">
          Nous vous accompagnons dans votre projet automobile
        </h2>

        <p className="mt-5 max-w-3xl leading-relaxed text-gray-300">
          Vous envisagez l’export d’un véhicule de moins de trois ans vers
          l’Algérie, ou souhaitez vous renseigner sur les démarches liées au
          CCR (certificat de changement de résidence) ? Contactez-nous pour
          échanger sur votre projet et les démarches à vérifier.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">
          Les conditions d’importation et d’éligibilité dépendent de la
          réglementation en vigueur et de votre situation. Elles doivent être
          confirmées auprès des autorités compétentes.
        </p>

        <Link
          to="/contact"
          className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#e53935] px-6 py-3 font-semibold text-white transition hover:bg-[#c62828]"
        >
          Parler de mon projet
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}