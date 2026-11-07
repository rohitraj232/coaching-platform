
// import Link from "next/link";
// import { ArrowUpRight, BookOpen, CheckCircle2 } from "lucide-react";
// import { courses } from "@/data/home";

// export default function CourseSection() {
//   return (
//     <section id="courses" className="scroll-mt-24 bg-white py-20">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
//           <div>
//             <p className="font-semibold text-orange-500">
//               OUR PROGRAMS
//             </p>
//             <h2 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
//               Find your class.
//               <span className="block text-blue-900">
//                 Start your journey.
//               </span>
//             </h2>
//           </div>

//           <p className="max-w-md leading-7 text-slate-600">
//             Structured learning programs designed to help
//             students understand concepts and practice regularly.
//           </p>
//         </div>

//         <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//           {courses.map((course) => (
//             <article
//               key={course.className}
//               className={`group rounded-2xl border border-slate-200 bg-gradient-to-br ${course.color} p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
//             >
//               <div className="flex items-center justify-between">
//                 <span className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-blue-900 shadow-sm">
//                   {course.className}
//                 </span>
//                 <BookOpen className="text-blue-900" size={25} />
//               </div>

//               <h3 className="mt-7 text-xl font-bold text-slate-900">
//                 {course.title}
//               </h3>

//               <p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">
//                 {course.description}
//               </p>

//               <div className="mt-5 space-y-3">
//                 {course.subjects.map((subject) => (
//                   <div
//                     key={subject}
//                     className="flex items-center gap-2 text-sm text-slate-700"
//                   >
//                     <CheckCircle2
//                       size={16}
//                       className="shrink-0 text-emerald-600"
//                     />
//                     {subject}
//                   </div>
//                 ))}
//               </div>

//               <Link
//                 href={course.href}
//                 className="mt-7 inline-flex items-center gap-2 font-semibold text-blue-900"
//               >
//                 Explore class
//                 <ArrowUpRight
//                   size={18}
//                   className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
//                 />
//               </Link>
//             </article>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }



import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const courses = [
  {
    title: "Class 6 - 8",
    session: "March - March",
    image: "/images/course/6-8.jpg",
    href: "class-6-8",
    status: "available",
  },
  {
    title: "Class 9 - 10",
    session: "March - June",
    image: "/images/course/9-10.jpg",
    href: "class-9-10",
    status: "available",
  },
  {
    title: "Class 11 - 12",
    session: "March - June",
    image: "/images/course/11-12.jpg",
    href: "class-11-12",
    status: "available",
  },
];

export default function CourseSection() {
  return (
    <section
      id="courses"
      className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-8 text-center sm:mb-10">
          <span className="inline-block rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-600">
            Find Your Learning Path
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Explore Our Courses
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Engaging lessons, expert guidance, and the right resources
            to help every student grow with confidence.
          </p>
        </div>

        {/* Course cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isAvailable = course.status === "available";

            return (
              <article
                key={course.title}
                className="group overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
              >
                {/* Course banner */}
                <Link
                  href={course.href}
                  aria-label={`View ${course.title} course`}
                  className="relative block aspect-[1/1] overflow-hidden"
                >
                  <Image
                    src={course.image}
                    alt={`Students learning in ${course.title}`}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Course details */}
                <div className="flex min-h-[140px] flex-col items-center px-4 pb-6 pt-3 text-center">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                    {course.title}
                  </h3>

                  {/* <span className="mt-2 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-slate-800">
                    {course.session}
                  </span> */}

                  {isAvailable ? (
                    <Link
                      href={course.href}
                      className="mt-3 inline-flex min-h-14 w-full max-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#F4512A] px-5 py-3 text-base font-extrabold text-white transition hover:bg-[#DC3F1C] focus:outline-none focus:ring-4 focus:ring-orange-200"
                    >
                      Explore Now
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`/contact?course=${encodeURIComponent(course.title)}`}
                      className="mt-3 inline-flex min-h-14 w-full max-w-[215px] items-center justify-center rounded-xl bg-[#64777D] px-5 py-3 text-base font-extrabold text-white transition hover:bg-[#4D6269] focus:outline-none focus:ring-4 focus:ring-slate-200"
                    >
                      Join the Waitlist
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}








// import Image from "next/image";
// import Link from "next/link";
// import {
//   FaBookOpen,
//   FaArrowRight,
// } from "react-icons/fa";

// import type { Course } from "@/types/course";

// interface CourseSectionProps {
//   courses: Course[];
// }

// export default function CourseSection({
//   courses,
// }: CourseSectionProps) {
//   return (
//     <section id="courses" className="bg-slate-50 py-16 md:py-20">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

//         {/* Section Heading */}
//         <div className="mb-10 text-center">
//           <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
//             Our Courses
//           </span>

//           <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
//             Explore Our Learning Programs
//           </h2>

//           <p className="mx-auto mt-3 max-w-2xl text-slate-600">
//             Choose the right learning program and build a strong
//             academic foundation with expert guidance.
//           </p>
//         </div>

//         {/* Course Cards */}
//         {courses.length > 0 ? (
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

//             {courses.map((course) => (
//               <div
//                 key={course.id}
//                 className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
//               >
//                 {/* Course Image */}
//                 <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-100">

//                   {course.image_url ? (
//                     <Image
//                       src={course.image_url}
//                       alt={course.title}
//                       fill
//                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//                       className="object-cover transition duration-500 group-hover:scale-105"
//                     />
//                   ) : (
//                     <FaBookOpen
//                       size={55}
//                       className="text-slate-300"
//                     />
//                   )}

//                   <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow">
//                     Class {course.class_level}
//                   </span>
//                 </div>

//                 {/* Course Details */}
//                 <div className="p-5">
//                   <h3 className="text-xl font-bold text-slate-900">
//                     {course.title}
//                   </h3>

//                   <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
//                     {course.description ||
//                       "Explore this learning program with expert guidance."}
//                   </p>

//                   <Link
//                     href={`/courses/${course.slug}`}
//                     className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
//                   >
//                     Explore Now
//                     <FaArrowRight size={13} />
//                   </Link>
//                 </div>
//               </div>
//             ))}

//           </div>
//         ) : (
//           <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
//             <FaBookOpen
//               size={35}
//               className="mx-auto mb-4 text-slate-400"
//             />

//             <h3 className="text-lg font-semibold text-slate-800">
//               No courses available
//             </h3>

//             <p className="mt-2 text-sm text-slate-500">
//               Please check back later for available courses.
//             </p>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
