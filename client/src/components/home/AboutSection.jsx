import {
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import heroImage from "../../assets/images/backgr2.png";

const highlights = [
  "Vente de véhicules d'occasion",
  "Entretien et réparation automobile",
  "Diagnostic automobile",
  "Accompagnement personnalisé",
];

export default function AboutSection() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

        {/* Image */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={heroImage}
              alt="Atelier automobile"
              className="h-[450px] w-full object-cover"
            />
          </div>

          {/* Decorative element */}
          
        </div>

        {/* Content */}
        <div>

          <p className="mb-3 font-semibold uppercase tracking-widest text-[#e53935]">
            À propos de nous
          </p>

          <h2 className="text-4xl font-bold leading-tight text-[#111111] md:text-5xl">
            Votre partenaire automobile à Mulhouse
          </h2>

          <p className="mt-6 leading-relaxed text-gray-600">
            Garage Millésime Auto vous accompagne dans vos projets
            automobiles, de l'achat de votre véhicule à son entretien
            au quotidien.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            Notre équipe met son savoir-faire automobile à votre service
            afin de vous proposer un accompagnement sérieux, transparent
            et adapté à vos besoins.
          </p>

          {/* Highlights */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-[#e53935]"
                />

                <span className="text-sm font-medium text-gray-700">
                  {highlight}
                </span>
              </div>
            ))}
          </div>

        
         

        </div>

      </div>
    </section>
  );
}