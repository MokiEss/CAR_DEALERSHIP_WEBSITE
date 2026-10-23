import {
  ShieldCheck,
  BadgeEuro,
  UserRound,
  Wrench,
} from "lucide-react";

const advantages = [
  {
    icon: ShieldCheck,
    title: "Véhicules contrôlés",
    description:
      "Nos véhicules sont soigneusement inspectés avant leur mise en vente.",
  },
  {
    icon: BadgeEuro,
    title: "Prix compétitifs",
    description:
      "Nous proposons des véhicules au juste prix, adaptés à différents budgets.",
  },
  {
    icon: UserRound,
    title: "Accompagnement personnalisé",
    description:
      "Notre équipe vous accompagne et vous conseille dans votre projet automobile.",
  },
  {
    icon: Wrench,
    title: "Service après-vente",
    description:
      "Nous restons à vos côtés pour l'entretien et le suivi de votre véhicule.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#111111] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 font-semibold uppercase tracking-wider text-[#e53935]">
            Notre engagement
          </p>

          <h2 className="text-4xl font-bold text-white">
          Pourquoi nous choisir ?
        </h2>

          <p className="mx-auto mt-4 max-w-2xl text-white">
            Chez Millésime Auto, nous mettons notre expertise et notre
            savoir-faire au service de votre projet automobile.
          </p>
        </div>

        {/* Advantages */}
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((advantage) => {
            const Icon = advantage.icon;

            return (
              <div
                key={advantage.title}
                className="rounded-xl border border-white/10 bg-black p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <Icon
                    size={32}
                    strokeWidth={1.8}
                    className="text-[#e53935]"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-lg font-bold text-white">
                  {advantage.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-white">
                  {advantage.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}