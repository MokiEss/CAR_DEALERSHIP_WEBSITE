import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import HomePage from "../pages/HomePage";
import VehiclesPage from "../pages/VehiclesPage";
import VehicleDetailsPage from "../pages/VehicleDetailsPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminVehiclesPage from "../pages/AdminVehiclesPage";
import RequireAdmin from "../components/auth/RequireAdmin";

import AboutSection from "../components/home/AboutSection";
import ContactSection from "../components/home/ContactSection";
import ServicesSection from "../components/home/ServicesSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import MainLayout from "../layouts/MainLayout";

function NotFoundPage() {
  return (
    <main className="min-h-[60vh] bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-[#111111]">
          Page introuvable
        </h1>
        <p className="mt-4 text-gray-600">
          L’URL demandée n’existe pas.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-md bg-[#e53935] px-6 py-3 font-semibold text-white"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicules" element={<VehiclesPage />} />
        <Route path="/vehicules/:id" element={<VehicleDetailsPage />} />

        <Route
          path="/atelier"
          element={
            <MainLayout>
              <ServicesSection />
             
            </MainLayout>
          }
        />

        <Route
          path="/a-propos"
          element={
            <MainLayout>
              <AboutSection />
              <WhyChooseUs />
            </MainLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <MainLayout>
              <ContactSection />
            </MainLayout>
          }
        />

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin/vehicles"
          element={
            <RequireAdmin>
              <AdminVehiclesPage />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}