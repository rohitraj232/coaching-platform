"use client";

import Image from "next/image";

const boards = [
  {
    name: "CBSE",
    subtitle: "Central Board",
    logo: "/images/boards/cbse.svg",
    color: "text-blue-700",
    background: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    name: "BSEB",
    subtitle: "Bihar Board",
    logo: "/images/boards/bseb.webp",
    color: "text-orange-700",
    background: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    name: "ICSE",
    subtitle: "ICSE Board",
    logo: "/images/boards/icse.avif",
    color: "text-purple-700",
    background: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    name: "KVS",
    subtitle: "Kendriya Vidyalaya Schools",
    logo: "/images/boards/kvs.jpg",
    color: "text-orange-700",
    background: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    name: "NVS",
    subtitle: "Navodaya Vidyalaya Schools",
    logo: "/images/boards/nvs.png",
    color: "text-cyan-700",
    background: "bg-cyan-50",
    border: "border-cyan-100",
  },
  {
    name: "SAINIK SCHOOL",
    subtitle: "Defence School Entrance",
    logo: "/images/boards/sainik.png",
    color: "text-pink-700",
    background: "bg-pink-50",
    border: "border-pink-100",
  },
];

export default function BoardSlider() {
  return (
    <section className="overflow-hidden bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-orange-600">
            Learning made accessible
          </span>

          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Your Preparation, Your Future
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Explore learning resources for boards and competitive exams.
          </p>
        </div>

        {/* Slider */}
        <div className="board-slider relative py-2">
          <div className="board-slider-track flex w-max gap-6">
            {[...boards, ...boards].map((board, index) => (
              <div
                key={`${board.name}-${index}`}
                aria-hidden={index >= boards.length}
                className={`flex min-w-[230px] items-center gap-4 rounded-2xl border ${board.border} ${board.background} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* Board Logo */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-sm">
                  <Image
                    src={board.logo}
                    alt={`${board.name} logo`}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Board Details */}
                <div>
                  <h3 className={`text-lg font-bold ${board.color}`}>
                    {board.name}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {board.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}