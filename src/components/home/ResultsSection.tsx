
// import { Award, BookOpen, GraduationCap, Users } from "lucide-react";
// import { achievements } from "@/data/home";

// const icons = [Users, BookOpen, GraduationCap, Award];

// export default function ResultsSection() {
//   return (
//     <section id="results" className="scroll-mt-24 bg-white py-20">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="rounded-3xl bg-blue-950 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
//           <div className="mx-auto max-w-2xl text-center">
//             <p className="font-semibold text-orange-400">
//               OUR LEARNING COMMUNITY
//             </p>
//             <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
//               Every step forward matters.
//             </h2>
//             <p className="mt-4 leading-7 text-blue-100">
//               Build strong foundations, practice consistently,
//               and work towards your academic goals.
//             </p>
//           </div>

//           <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
//             {achievements.map((item, index) => {
//               const Icon = icons[index];

//               return (
//                 <div
//                   key={item.label}
//                   className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
//                 >
//                   <Icon
//                     className="mx-auto text-orange-400"
//                     size={28}
//                   />
//                   <p className="mt-4 text-2xl font-extrabold sm:text-3xl">
//                     {item.value}
//                   </p>
//                   <p className="mt-2 text-sm text-blue-100">
//                     {item.label}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>

//           <p className="mt-8 text-center text-xs text-blue-200">
//             Replace sample figures with verified institute data.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }



import Link from "next/link";
import {
  Trophy,
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  Star,
  Medal,
  Target,
  Award,
} from "lucide-react";

const achievementStats = [
  {
    value: "—",
    label: "Students Guided",
    description: "Add your verified student count",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
  },
  {
    value: "—",
    label: "Successful Results",
    description: "Add verified results",
    icon: Trophy,
    color: "bg-orange-50 text-orange-600",
  },
  {
    value: "CBSE",
    label: "Board Preparation",
    description: "Structured learning support",
    icon: GraduationCap,
    color: "bg-purple-50 text-purple-700",
  },
  {
    value: "BSEB",
    label: "Board Preparation",
    description: "Focused exam preparation",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-700",
  },
];

const resultHighlights = [
  {
    title: "Academic Excellence",
    description:
      "Focused learning and regular practice to help students improve their academic performance.",
    icon: Trophy,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Conceptual Clarity",
    description:
      "Understand difficult topics with simple explanations and expert teaching guidance.",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Exam Confidence",
    description:
      "Build confidence through practice tests, revision sessions, and exam preparation.",
    icon: Target,
    color: "bg-purple-100 text-purple-600",
  },
];

export default function ResultsSection() {
  return (
    <section
      id="results"
      className="relative overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-yellow-700">
            <Trophy size={16} />
            Our Achievements
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Every Student Has a
            <span className="text-orange-500"> Success Story</span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            We believe in building strong concepts, developing confidence,
            and helping every student move closer to their academic goals.
          </p>
        </div>

        {/* Statistics cards */}
        {/* <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {achievementStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label + stat.value}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {stat.value}
                </h3>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {stat.label}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div> */}

        {/* Main achievement banner */}
        <div className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-orange-300">
                <Star size={15} className="fill-orange-300" />
                Learning Beyond Limits
              </span>

              <h3 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Your Hard Work.
                <span className="block text-orange-400">
                  Your Achievement.
                </span>
              </h3>

              <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100 sm:text-base">
                Success comes from consistent effort, the right guidance,
                and a strong learning foundation. We are here to support
                students at every step of their journey.
              </p>

              <Link
                href="/courses"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Explore Our Courses
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Achievement visual */}
            <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
              <div className="absolute h-64 w-64 rounded-full bg-blue-400/20 blur-2xl" />

              <div className="relative flex h-64 w-64 flex-col items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-500/30">
                  <Trophy size={54} />
                </div>

                <h4 className="mt-5 text-xl font-extrabold text-white">
                  Dream Big
                </h4>

                <p className="mt-2 text-sm text-blue-100">
                  Learn. Practice. Excel.
                </p>

                <div className="absolute -right-4 top-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-yellow-950 shadow-lg">
                  <Medal size={30} />
                </div>

                <div className="absolute -bottom-2 -left-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950 shadow-lg">
                  <Award size={30} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement highlights */}
        <div className="mt-12">
          <div className="mb-7 text-center">
            <h3 className="text-2xl font-extrabold text-slate-900">
              What Makes Us Different?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              The right support for every step of your learning journey.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {resultHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6 transition hover:border-blue-100 hover:bg-white hover:shadow-lg"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <h4 className="mt-5 text-lg font-bold text-slate-900">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
