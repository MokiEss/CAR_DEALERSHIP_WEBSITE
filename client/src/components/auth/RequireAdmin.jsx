import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import api from "../../services/api";
import { clearAuthToken, getAuthToken } from "../../services/authService";

export default function RequireAdmin({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifyAdminSession() {
      if (!getAuthToken()) {
        setStatus("unauthorized");
        return;
      }

      try {
        await api.get("/auth/verify");
        if (!cancelled) setStatus("authorized");
      } catch {
        clearAuthToken();
        if (!cancelled) setStatus("unauthorized");
      }
    }

    verifyAdminSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Vérification de la session…</p>
      </main>
    );
  }

  if (status === "unauthorized") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}