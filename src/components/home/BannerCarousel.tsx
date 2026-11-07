"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const banners = [
  {
    id: 1,
    image: "/images/banners/banner-1.jpeg",
    title: "Shape Your Future With Quality Education",
    description:
      "Learn from expert educators and achieve your academic goals with the right guidance.",
    buttonText: "Explore Courses",
    link: "/courses",
  },
  {
    id: 2,
    image: "/images/banners/banner-3.jpeg",
    title: "Prepare Today, Succeed Tomorrow",
    description:
      "Get access to structured learning resources, mock tests, and expert guidance.",
    buttonText: "Start Learning",
    link: "/courses",
  },
  {
    id: 3,
    image: "/images/banners/banner-4.jpeg",
    title: "Your Success Is Our Mission",
    description:
      "Build confidence and prepare for your dream examination with us.",
    buttonText: "Join Now",
    link: "/contact",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden mx-auto max-w-7xl">
      {/* Carousel */}
      <div className="relative aspect-[19/6] min-h-[260px] w-full sm:min-h-[350px] lg:min-h-0">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              current === index
                ? "z-10 opacity-100"
                : "z-0 opacity-0"
            }`}
          >
            {/* Banner Image */}
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-contain rounded-3"
            />
        
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        aria-label="Previous banner"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-md transition hover:bg-white sm:left-6 sm:h-12 sm:w-12"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        aria-label="Next banner"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-md transition hover:bg-white sm:right-6 sm:h-12 sm:w-12"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            onClick={() => setCurrent(index)}
            aria-label={`Go to banner ${index + 1}`}
            aria-current={current === index}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === index
                ? "w-8 bg-orange-600"
                : "w-2.5 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}