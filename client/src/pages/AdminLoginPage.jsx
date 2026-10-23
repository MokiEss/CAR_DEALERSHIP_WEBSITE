import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldAlert } from "lucide-react";

import { loginAdmin, saveAuthToken } from "../services/authService";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = location.state?.from;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Identifiant et mot de passe obligatoires.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginAdmin(username.trim(), password);

      if (!data?.token) {
        setError("Réponse invalide du serveur.");
        return;
      }

      saveAuthToken(data.token);

      const destination =
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/admin/") &&
        requestedPath !== "/admin/login"
          ? requestedPath
          : "/admin/vehicles";

      navigate(destination, { replace: true });;
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Identifiants incorrects.");
      } else {
        setError("Impossible de se connecter. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-[#e53935]">
            <ShieldAlert size={16} />
            Espace administration
          </p>

          <h1 className="text-3xl font-bold text-[#111111]">
            Connexion admin
          </h1>

          <p className="mt-2 text-gray-600">
            Connectez-vous pour gérer le stock de véhicules.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="admin-username"
          >
            Identifiant
          </label>

          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mb-5 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
            placeholder="admin"
          />

          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="admin-password"
          >
            Mot de passe
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100"
            placeholder="Votre mot de passe"
          />

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm font-semibold text-[#e53935] hover:underline"
          >
            Retour au site
          </Link>
        </div>
      </div>
    </main>
  );
}