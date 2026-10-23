import {
  Wrench,
  Settings,
  CircleDot,
  ScanSearch,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Wrench,
    title: "Entretien automobile",
    description:
      "Entretien courant, révisions et contrôles pour préserver les performances et la fiabilité de votre véhicule.",
  },
  {
    icon: Settings,
    title: "Réparation",
    description:
      "Une équipe à votre service pour prendre en charge les réparations mécaniques de votre véhicule.",
  },
  {
    icon: CircleDot,
    title: "Pneumatiques",
    description:
      "Montage, remplacement et entretien de vos pneumatiques pour une conduite en toute sécurité.",
  },
  {
    icon: ScanSearch,
    title: "Diagnostic automobile",
    description:
      "Identification des anomalies et recherche de pannes grâce au diagnostic de votre véhicule.",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#111111] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 font-semibold uppercase tracking-widest text-[#e53935]">
            Notre savoir-faire
          </p>

          <h2 className="text-4xl font-bold md:text-5xl">
            Nos services
          </h2>

          <p className="mt-5 leading-relaxed text-gray-400">
            Au-delà de la vente automobile, notre garage vous accompagne
            également dans l'entretien et la réparation de votre véhicule.
          </p>
        </div>

        {/* Services */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group rounded-xl border border-gray-800 bg-[#181818] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#e53935]"
              >
                {/* Icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#e53935]/10">
                  <Icon
                    size={30}
                    strokeWidth={1.7}
                    className="text-[#e53935]"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mt-4 text-sm leading-relaxed text-gray-400">
                  {service.description}
                </p>

                
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}