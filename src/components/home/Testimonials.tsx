"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Ananya Sharma",
    course: "NVS Entrance Preparation",
    image: "/assets/images/team/1.jpg",
    rating: 5,
    message:
      "The mental ability and arithmetic classes are very helpful. Regular mock tests and practice sessions have made my Navodaya entrance preparation much better.",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    course: "CBSE Class 12 – Science",
    image: "/assets/images/team/2.jpg",
    rating: 5,
    message:
      "The teachers explain Physics, Chemistry and Mathematics in a simple way. Their concept-based teaching and regular tests have improved my understanding.",
  },
  {
    id: 3,
    name: "Priya Singh",
    course: "BSEB Class 10",
    image: "/assets/images/team/3.jpg",
    rating: 5,
    message:
      "The classes are well-structured and follow the Bihar Board syllabus. Chapter-wise notes, important questions and revision sessions make exam preparation easier.",
  },
  {
    id: 4,
    name: "Aman Verma",
    course: "ICSE Class 10",
    image: "/assets/images/team/1.jpg",
    rating: 5,
    message:
      "I really appreciate the detailed explanations and regular practice. The teachers focus on conceptual clarity, written answers and exam-oriented preparation.",
  },
  {
    id: 5,
    name: "Sneha Gupta",
    course: "KVS Entrance Preparation",
    image: "/assets/images/team/2.jpg",
    rating: 5,
    message:
      "The mathematics, reasoning and language sessions are very useful. Regular practice questions and mock tests have helped me prepare with more confidence.",
  },
  {
    id: 6,
    name: "Arjun Mehta",
    course: "Sainik School Entrance Preparation",
    image: "/assets/images/team/3.jpg",
    rating: 5,
    message:
      "The preparation covers mathematics, intelligence, English and general knowledge. The teachers explain every topic clearly and provide helpful practice material.",
  },
  {
    id: 7,
    name: "Kavya Reddy",
    course: "CBSE Class 9",
    image: "/assets/images/team/1.jpg",
    rating: 5,
    message:
      "The live classes are interactive and easy to follow. Regular assignments and doubt-clearing sessions have helped me build a strong foundation in every subject.",
  },
  {
    id: 8,
    name: "Aditya Sharma",
    course: "BSEB Class 12 – Science",
    image: "/assets/images/team/2.jpg",
    rating: 5,
    message:
      "The teachers provide excellent guidance for board examinations. The chapter-wise revision, important questions and regular assessments make learning more effective.",
  },
];

export default function Testimonials() {
  const cardsPerSlide = 4;

  const totalSlides = Math.ceil(
    testimonials.length / cardsPerSlide
  );

  const [current, setCurrent] = useState(0);

  // ============================================
  // AUTO SLIDE
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  // ============================================
  // GET 4 CARDS
  // 2 TOP + 2 BOTTOM
  // ============================================
  const visibleTestimonials = Array.from(
    { length: cardsPerSlide },
    (_, index) => {
      const testimonialIndex =
        (current * cardsPerSlide + index) %
        testimonials.length;

      return testimonials[testimonialIndex];
    }
  );

  // ============================================
  // PREVIOUS
  // ============================================
  const handlePrevious = () => {
    setCurrent((prev) =>
      prev === 0 ? totalSlides - 1 : prev - 1
    );
  };

  // ============================================
  // NEXT
  // ============================================
  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* ============================================
            SECTION HEADING
        ============================================ */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
            Student Reviews
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            What Our Students Say
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Hear from students who achieved their goals with
            the help of our expert mentors.
          </p>
        </div>

        {/* ============================================
            MAIN CONTENT
        ============================================ */}
        <div className="grid gap-8 lg:grid-cols-[360px_1fr] items-center">

          {/* ============================================
              LEFT - MENTOR
          ============================================ */}
          <div className="relative">

            <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl">

              {/* Decorative Background */}
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10" />

              <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-indigo-500/10" />

              {/* Mentor Image */}
              <div className="relative mx-auto h-50 w-50 md:h-72 md:w-72 max-w-full overflow-hidden rounded-full border-8 border-white/10">
                <Image
                  src="/images/teacher/teacher2.jpeg"
                  alt="Expert Mentor"
                  fill
                  className="object-cover object-top"
                  sizes="288px"
                />
              </div>

              {/* Mentor Info */}
              <div className="relative mt-7 text-center">

                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-indigo-200">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Expert Mentor
                </div>

                <h3 className="text-3xl font-bold">
                    Manish Kumar
                </h3>

                <p className="mt-2 text-slate-300">
                  Senior Faculty & Career Mentor
                </p>

              </div>

              {/* Stats */}
              <div className="relative mt-8 grid grid-cols-3 divide-x divide-white/10 text-center">

                <div>
                  <p className="text-2xl font-bold">
                    10+
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Years Exp.
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    500+
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Students
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    4.2
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Rating
                  </p>
                </div>

              </div>

              {/* Quote */}
              <div className="relative mt-8 rounded-2xl bg-white/10 p-5">

                <p className="text-sm leading-6 text-slate-300">
                  "Our goal is not just to teach students,
                  but to help them understand, practice and
                  confidently achieve their goals."
                </p>

              </div>

            </div>
          </div>

          {/* ============================================
              RIGHT - TESTIMONIALS
              2 TOP + 2 BOTTOM
          ============================================ */}
          <div className="flex min-w-0 flex-col">

            {/* 2 x 2 GRID */}
            <div
              key={current}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              {visibleTestimonials.map((item) => (
                <div
                  key={item.id}
                  className="group flex min-h-[245px] flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl"
                >

                  {/* ====================================
                      TOP ROW
                  ==================================== */}
                  <div className="flex items-center justify-between">

                    {/* Stars */}
                    <div className="text-sm tracking-wide text-yellow-400">
                      {"★".repeat(item.rating)}

                      <span className="text-slate-200">
                        {"★".repeat(5 - item.rating)}
                      </span>
                    </div>

                    {/* Verified */}
                    {/* <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                      ✓ Verified
                    </span> */}

                  </div>

                  {/* ====================================
                      QUOTE ICON
                  ==================================== */}
                  <div className="mt-2">

                    <div className="text-3xl font-serif leading-none text-indigo-100">
                      "
                    </div>

                    {/* Message */}
                    <p className="text-sm leading-6 text-slate-600">
                      {item.message}
                    </p>

                  </div>

                  {/* ====================================
                      STUDENT INFO
                  ==================================== */}
                  <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-5">

                    {/* Student Image */}
                    {/* <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="48px"
                      />
                    </div> */}

                    {/* Name + Course */}
                    <div className="min-w-0">

                      <h4 className="truncate font-semibold text-slate-900">
                        {item.name}
                      </h4>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {item.course}
                      </p>

                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* ============================================
                CONTROLS
            ============================================ */}
            <div className="mt-7 flex items-center justify-between">

              {/* Previous */}
              <button
                type="button"
                onClick={handlePrevious}
                aria-label="Previous testimonials"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
              >
                ←
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">

                {Array.from({
                  length: totalSlides,
                }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrent(index)}
                    aria-label={`Go to testimonial slide ${
                      index + 1
                    }`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      current === index
                        ? "w-8 bg-indigo-600"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}

              </div>

              {/* Next */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonials"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
              >
                →
              </button>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}