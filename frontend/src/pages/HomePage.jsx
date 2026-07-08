import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import MissionVision from "@/components/MissionVision";
import Programs from "@/components/Programs";
import Impact from "@/components/Impact";
import Gallery from "@/components/Gallery";
import VolunteerForm from "@/components/VolunteerForm";
import Donate from "@/components/Donate";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div data-testid="home-page" className="min-h-screen bg-slate-50 font-inter text-slate-800">
      <Navbar />
      <main>
        <Hero />
        <About />
        <MissionVision />
        <Programs />
        <Impact />
        <Gallery />
        <VolunteerForm />
        <Donate />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
