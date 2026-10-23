import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import api from "../../services/api";

const openingHours = [
  { day: "Lundi", hours: "14:00 – 18:00" },
  { day: "Mardi – Vendredi", hours: "09:00 – 12:00 / 14:00 – 18:00" },
  { day: "Samedi", hours: "09:00 – 12:00" },
  { day: "Dimanche", hours: "Fermé" },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#e53935] focus:ring-2 focus:ring-red-100";

export default function ContactSection() {
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setSubmitError("");
    setSubmitSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await api.post("/contact", {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        message: formData.get("message"),
      });

      setSubmitSuccess(
        response.data?.message || "Votre message a bien été envoyé."
      );
      form.reset();
    } catch (error) {
      setSubmitError(
        error.response?.data?.error ||
          "Impossible d'envoyer le message. Réessayez plus tard."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <p className="mb-3 font-semibold uppercase tracking-widest text-[#e53935]">
            Contact
          </p>

          <h2 className="text-4xl font-bold text-[#111111] md:text-5xl">
            Parlons de votre projet automobile
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Une question concernant un véhicule ou besoin d'un service
            automobile ? Contactez notre équipe.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 rounded-2xl bg-[#111111] p-8 text-white">
            <h3 className="text-2xl font-bold">Nos coordonnées</h3>

            <div className="flex gap-4">
              <MapPin
                className="mt-1 shrink-0 text-[#e53935]"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">Adresse</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  43 A rue de Ruelisheim
                  <br />
                  68200 Mulhouse
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone
                className="mt-1 shrink-0 text-[#e53935]"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">Téléphone</p>
                <a
                  href="tel:+33389574612"
                  className="mt-1 block text-sm text-gray-400 transition hover:text-white"
                >
                  03 89 57 46 12
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <Mail
                className="mt-1 shrink-0 text-[#e53935]"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">Email</p>
                <a
                  href="mailto:millesime.auto@orange.fr"
                  className="mt-1 block text-sm text-gray-400 transition hover:text-white"
                >
                  millesime.auto@orange.fr
                </a>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="mb-4 flex items-center gap-3">
                <Clock className="text-[#e53935]" aria-hidden="true" />
                <h4 className="font-semibold">Horaires d'ouverture</h4>
              </div>

              <div className="space-y-3">
                {openingHours.map((item) => (
                  <div
                    key={item.day}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-gray-400">{item.day}</span>
                    <span className="text-right text-gray-200">
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm lg:col-span-2">
            <h3 className="text-2xl font-bold text-[#111111]">
              Envoyez-nous un message
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Nous vous répondrons dans les meilleurs délais.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Nom *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="Votre nom"
                    autoComplete="name"
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Téléphone
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="Votre numéro"
                    autoComplete="tel"
                    maxLength={30}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Votre message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Comment pouvons-nous vous aider ?"
                  maxLength={5000}
                  required
                  className={`${inputClass} resize-y`}
                />
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-red-700">
                  {submitError}
                </p>
              )}

              {submitSuccess && (
                <p role="status" className="text-sm text-green-700">
                  {submitSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-lg bg-[#e53935] px-6 py-3 font-semibold text-white transition hover:bg-[#c62828] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Envoi…" : "Envoyer le message"}
                <Send size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-gray-200">
          <iframe
            title="Garage Millésime Auto - Localisation"
            src="https://www.google.com/maps?q=43+A+Rue+de+Ruelisheim,+68200+Mulhouse&output=embed"
            className="h-[400px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}