
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import HeroSection from "@/components/home/HeroSection";
import CourseSection from "@/components/home/CourseSection";
import VideoSection from "@/components/home/VideoSection";
// import ResultsSection from "@/components/home/ResultsSection";

import BannerCarousel from "@/components/home/BannerCarousel";
import Testimonials from "@/components/home/Testimonials";

export default async function HomePage() {

  return (
    <>
      <Navbar />

      <main>

        <HeroSection />

        <BannerCarousel />
        <CourseSection />

        <VideoSection />

        <Testimonials />
      </main>

      <Footer />
    </>
  );
}
