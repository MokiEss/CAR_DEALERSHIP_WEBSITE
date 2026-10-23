import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/logo.png";

const links = [
  { to: "/", label: "Accueil", end: true },
  { to: "/vehicules", label: "Véhicules" },
  { to: "/atelier", label: "Atelier" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

function linkClassName({ isActive }) {
  return isActive
    ? "font-semibold text-[#e53935]"
    : "text-white transition hover:text-[#e53935]";
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-[#111111] text-white shadow-lg">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto] items-center px-6 md:grid-cols-[1fr_auto_1fr]">
        <NavLink
          to="/"
          aria-label="Garage Millésime Auto, accueil"
          onClick={closeMenu}
          className="justify-self-start"
        >
          
        </NavLink>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center justify-center gap-6 lg:gap-8 md:flex"
        >
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClassName}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <a
          href="tel:+33389574612"
          className="hidden items-center justify-self-end gap-2 text-sm font-medium lg:flex"
        >
          <Phone size={18} aria-hidden="true" />
          03 89 57 46 12
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="justify-self-end rounded-md p-2 transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navigation mobile"
          className="border-t border-white/10 bg-[#111111] px-6 py-4 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className={linkClassName}
              >
                {label}
              </NavLink>
            ))}

            <a
              href="tel:+33389574612"
              className="inline-flex items-center gap-2 border-t border-white/10 pt-4 font-medium"
            >
              <Phone size={18} aria-hidden="true" />
              03 89 57 46 12
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}