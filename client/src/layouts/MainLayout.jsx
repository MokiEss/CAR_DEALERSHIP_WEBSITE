import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}