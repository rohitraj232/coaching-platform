
// import Link from "next/link";
// import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

// export default function Footer() {
//   return (
//     <footer id="contact" className="scroll-mt-24 bg-slate-950 text-slate-300">
//       <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
//         <div>
//           <Link href="/" className="flex items-center gap-2 text-white">
//             <GraduationCap size={30} className="text-orange-400" />
//             <span className="text-xl font-extrabold">
//               LearnNextJS
//             </span>
//           </Link>

//           <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
//             Helping students build strong concepts and prepare
//             for examinations with structured learning and practice.
//           </p>
//         </div>

//         <div>
//           <h2 className="font-bold text-white">Quick Links</h2>
//           <div className="mt-4 flex flex-col gap-3 text-sm">
//             <Link href="/" className="hover:text-orange-400">Home</Link>
//             <Link href="/#courses" className="hover:text-orange-400">Courses</Link>
//             <Link href="/#lectures" className="hover:text-orange-400">Lectures</Link>
//             <Link href="/#results" className="hover:text-orange-400">Results</Link>
//           </div>
//         </div>

//         <div>
//           <h2 className="font-bold text-white">Student Resources</h2>
//           <div className="mt-4 flex flex-col gap-3 text-sm">
//             <Link href="/login" className="hover:text-orange-400">Student Login</Link>
//             <Link href="/register" className="hover:text-orange-400">Create Account</Link>
//             <Link href="/quizzes" className="hover:text-orange-400">Practice Quizzes</Link>
//             <Link href="/contact" className="hover:text-orange-400">Contact Us</Link>
//           </div>
//         </div>

//         <div>
//           <h2 className="font-bold text-white">Get in Touch</h2>
//           <div className="mt-4 flex flex-col gap-4 text-sm text-slate-400">
//             <p className="flex items-start gap-3">
//               <MapPin size={18} className="shrink-0 text-orange-400" />
//               Add your institute address
//             </p>
//             <p className="flex items-start gap-3">
//               <Phone size={18} className="shrink-0 text-orange-400" />
//               Add your contact number
//             </p>
//             <p className="flex items-start gap-3">
//               <Mail size={18} className="shrink-0 text-orange-400" />
//               Add your official email
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="border-t border-white/10">
//         <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
//           <p>© {new Date().getFullYear()} Learn NextJS. All rights reserved.</p>
//           <div className="flex gap-5">
//             <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
//             <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }



import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Courses", href: "/#courses" },
  { label: "Latest Lectures", href: "/#lectures" },
  { label: "Results", href: "/#results" },
  { label: "Contact Us", href: "/contact" },
];

const courses = [
  { label: "Class 8", href: "/courses/class-8" },
  { label: "Class 9", href: "/courses/class-9" },
  { label: "Class 10", href: "/courses/class-10" },
  { label: "Class 11", href: "/courses/class-11" },
  { label: "Class 12", href: "/courses/class-12" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: FaInstagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    icon: FaYoutube,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-[#071B35] text-white">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Institute information */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight">
                Accelerate<span className="text-orange-400"> Academy</span>
                <p className="text-sm font-medium mt-[-5px]">Siwan, Bihar</p>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">
              Empowering students through quality education, expert
              guidance, regular practice, and accessible learning
              resources.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-orange-400 hover:bg-orange-500 hover:text-white"
                  >
                    <Icon size={19} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold text-white">
              Quick Links
            </h3>

            <div className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group flex items-center gap-2 text-sm text-slate-300 transition hover:text-orange-400"
                >
                  <ChevronRight
                    size={15}
                    className="text-orange-400 transition group-hover:translate-x-1"
                  />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-bold text-white">
              Our Courses
            </h3>

            <div className="mt-5 space-y-3">
              {courses.map((course) => (
                <Link
                  key={course.label}
                  href={course.href}
                  className="group flex items-center gap-2 text-sm text-slate-300 transition hover:text-orange-400"
                >
                  <ChevronRight
                    size={15}
                    className="text-orange-400 transition group-hover:translate-x-1"
                  />
                  {course.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact information */}
          <div>
            <h3 className="text-lg font-bold text-white">
              Get In Touch
            </h3>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-1 shrink-0 text-orange-400"
                />
                <p className="text-sm leading-6 text-slate-300">
                  Your Coaching Institute Address,
                  <br />
                  City, State, India
                </p>
              </div>

              <a
                href="tel:+910000000000"
                className="flex items-center gap-3 text-sm text-slate-300 transition hover:text-orange-400"
              >
                <Phone size={18} className="shrink-0 text-orange-400" />
                +91 00000 00000
              </a>

              <a
                href="mailto:info@example.com"
                className="flex items-center gap-3 break-all text-sm text-slate-300 transition hover:text-orange-400"
              >
                <Mail size={18} className="shrink-0 text-orange-400" />
                info@example.com
              </a>

              <div className="flex items-start gap-3">
                <Clock
                  size={18}
                  className="mt-1 shrink-0 text-orange-400"
                />
                <p className="text-sm leading-6 text-slate-300">
                  Monday - Saturday
                  <br />
                  8:00 AM - 6:00 PM
                </p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/910000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle size={19} />
              Chat on WhatsApp
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Board information strip */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 px-5 py-5">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-bold text-white">
                Learning for Every Student
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Structured academic support and exam preparation.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {["CBSE", "BSEB", "Classes 8–12"].map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-orange-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
            © {currentYear} Accelerate Academy | Siwan (Bihar). All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-slate-400 transition hover:text-orange-400"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-slate-400 transition hover:text-orange-400"
            >
              Terms & Conditions
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Made with <span className="text-red-400">♥</span> for learners
          </p>
        </div>
      </div>
    </footer>
  );
}
