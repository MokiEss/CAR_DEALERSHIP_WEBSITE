import AboutSection from "../components/home/AboutSection";
import ContactSection from "../components/home/ContactSection";
import FeaturedVehicles from "../components/home/FeaturedVehicles";
import Hero from "../components/home/Hero";
import ServicesSection from "../components/home/ServicesSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import MainLayout from "../layouts/MainLayout";
import AlgeriaImportSection from "../components/home/AlgeriaImportSection";
export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      
      <FeaturedVehicles />
      
      <WhyChooseUs />
      
    </MainLayout>
  );
}