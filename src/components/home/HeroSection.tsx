
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  FileText,
  PlayCircle,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import BoardSlider from "./BoardSlider";

const highlights = [
  {
    icon: BookOpen,
    title: "Expert Faculty",
    subtitle: "Personal guidance",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: PlayCircle,
    title: "Live & Recorded",
    subtitle: "Learn anytime",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: FileText,
    title: "Study Material",
    subtitle: "Notes, PDFs & tests",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

const floatingCards = [
  {
    title: "Teaching Experience",
    value: "10+ Years",
    icon: GraduationCap,
    position: "left-[-4%] top-[12%]",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  {
    title: "CBSE Board",
    value: "Classes 8–12",
    icon: BookOpen,
    position: "right-0 top-[18%]",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  {
    title: "BSEB Board",
    value: "Classes 8–12",
    icon: FileText,
    position: "left-[-3%] top-[43%]",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  {
    title: "Student Support",
    value: "Concept-based learning",
    icon: Users,
    position: "right-[-2%] top-[54%]",
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        {/* Left content */}
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
            <GraduationCap size={18} />
            Learn · Practice · Succeed
          </div>

          <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Better Learning,
            <span className="mt-1 block text-orange-500">
              Brighter Future
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Your trusted coaching destination for Classes 8 to 12.
            Learn from expert teachers, access quality study materials,
            watch video lectures, and prepare confidently for your exams.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <GraduationCap size={20} />
              Explore Courses
              <ArrowRight size={18} />
            </Link>

            <a
              href="https://www.youtube.com/@AccelerateAcademy2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50"
            >
              <PlayCircle size={20} className="text-red-600" />
              Watch YouTube Lectures
            </a>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right teacher image and floating cards */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          {/* Decorative circle behind teacher */}
          <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200" />

          <div className="absolute left-[12%] top-[14%] h-20 w-20 rounded-full border border-white/80 bg-white/30" />
          <div className="absolute bottom-[12%] right-[10%] h-24 w-24 rounded-full bg-orange-200/40 blur-xl" />

          {/* Teacher portrait */}
          <div className="relative z-10 mx-auto aspect-[4/5] w-[76%] max-w-[390px]">
            <img
              src="/images/teacher/main.png"
              alt="Manish Sir"
              className="object-contain object-bottom drop-shadow-xl"
            />
          </div>

          {/* Floating cards */}
          {floatingCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className={`absolute ${card.position} z-20 flex max-w-[250px] items-center gap-3 rounded-2xl border border-white bg-white/95 p-3 shadow-lg shadow-slate-200/70 backdrop-blur-sm sm:p-4`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
                >
                  <Icon size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs leading-4 text-slate-500">
                    {card.title}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Bottom result card */}
          <div className="absolute bottom-[5%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-xl sm:bottom-[5%]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <Trophy size={22} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Focused on Student Success
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Star size={13} className="fill-yellow-400 text-yellow-400" />
                <span>Learn with confidence</span>
                <CheckCircle2
                  size={13}
                  className="ml-1 text-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BoardSlider />
    </section>
  );
}
