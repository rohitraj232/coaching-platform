
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import BoardSlider from "@/components/home/BoardSlider";
import HeroSection from "@/components/home/HeroSection";
import CourseSection from "@/components/home/CourseSection";
import VideoSection from "@/components/home/VideoSection";
import ResultsSection from "@/components/home/ResultsSection";

import { getCourses } from "@/lib/supabase/queries/courses";
import BannerCarousel from "@/components/home/BannerCarousel";
import Testimonials from "@/components/home/Testimonials";

export default async function HomePage() {
  const courses = await getCourses();

  return (
    <>
      <Navbar />

      <main>

        <HeroSection />

        <BannerCarousel />
        {/* <BoardSlider /> */}
        <CourseSection courses={courses} />

        <VideoSection />

<Testimonials />
        {/* <ResultsSection /> */}
      </main>

      <Footer />
    </>
  );
}
