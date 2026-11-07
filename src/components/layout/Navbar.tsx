
"use client";

import { useEffect, useMemo, useState } from "react";
// import type { User } from "@supabase/supabase-js";
// import { createClient } from "@/lib/supabase/client";
import { FaUserCircle, FaSignInAlt } from "react-icons/fa";
import Link from "next/link";
import {
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Video,
  Trophy,
  FileDown,
  Home,
  Info,
  Phone,
  LogIn,
  ClipboardList
} from "lucide-react";

const courseClasses = [
  { label: "Class 8", slug: "class-8" },
  { label: "Class 9", slug: "class-9" },
  { label: "Class 10", slug: "class-10" },
  { label: "Class 11", slug: "class-11" },
  { label: "Class 12", slug: "class-12" },
];

const courseResources = [
  { label: "Notes", slug: "notes", icon: BookOpen },
  { label: "Videos", slug: "videos", icon: Video },
  { label: "Results", slug: "results", icon: Trophy },
  { label: "PDF", slug: "pdf", icon: FileDown },
  { label: "Test Series", slug: "test-series", icon: ClipboardList },
];

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Phone },
  { label: "Careers", href: "/careers", icon: Phone },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [mobileOpenClass, setMobileOpenClass] = useState<string | null>(null);

  // const supabase = useMemo(() => createClient(), []);

  // const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // useEffect(() => {
  //   let mounted = true;

  //   // Listen for login, logout and session changes
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     if (mounted) {
  //       setUser(session?.user ?? null);
  //       setAuthLoading(false);
  //     }
  //   });

  //   // Check existing session when Navbar loads
  //   supabase.auth.getUser().then(({ data, error }) => {
  //     if (mounted) {
  //       setUser(error ? null : data.user);
  //       setAuthLoading(false);
  //     }
  //   });

  //   return () => {
  //     mounted = false;
  //     subscription.unsubscribe();
  //   };
  // }, [supabase]);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setCoursesOpen(false);
    setActiveClass(null);
    setMobileOpenClass(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-2"
        >
          <img
            src="/logo.png"
            alt=""
            className=""
            width={40}
            loading="lazy"
          />
          <div>
            <p className="text-xl font-extrabold tracking-tight text-slate-900">
              Accelerate<span className="text-orange-500"> Academy</span>
            </p>
            <p className="text-sm font-medium mt-[-5px]">Siwan, Bihar</p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
          >
            Home
          </Link>

          {/* Courses dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => {
              setCoursesOpen(false);
              setActiveClass(null);
            }}
          >
            <button
              type="button"
              aria-expanded={coursesOpen}
              onClick={() => {
                setCoursesOpen((prev) => !prev);
                setActiveClass(null);
              }}
              onFocus={() => setCoursesOpen(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
            >
              Courses
              <ChevronDown
                size={16}
                className={`transition-transform ${coursesOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {coursesOpen && (
              <div className="absolute left-0 top-full w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select your class
                </p>

                {courseClasses.map((course) => (
                  <div
                    key={course.slug}
                    className="relative"
                    onMouseEnter={() => setActiveClass(course.slug)}
                    onMouseLeave={() => setActiveClass(null)}
                  >
                    <button
                      type="button"
                      aria-expanded={activeClass === course.slug}
                      onClick={() =>
                        setActiveClass((prev) =>
                          prev === course.slug ? null : course.slug
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeClass === course.slug
                        ? "bg-blue-50 text-blue-900"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {course.label}
                      <ChevronRight size={16} />
                    </button>

                    {/* Nested resources dropdown */}
                    {activeClass === course.slug && (
                      <div className="absolute left-full top-0 z-50 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                        <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          {course.label} resources
                        </p>

                        {courseResources.map((resource) => {
                          const Icon = resource.icon;

                          return (
                            <Link
                              key={resource.slug}
                              href={`/courses/${course.slug}/${resource.slug}`}
                              onClick={closeMenus}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                            >
                              <Icon size={17} />
                              {resource.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop login */}

        {/* Desktop Authentication */}
        {/* <div className="hidden lg:block">
          {authLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-100" />
          ) : user ? (
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              <FaUserCircle size={18} />
              Profile
            </Link>
          ) : (
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              <FaSignInAlt size={17} />
              Login / Register
            </Link>
          )}
        </div> */}

        <div className="hidden lg:block">
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            <FaSignInAlt size={17} />
            Login / Register
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1">
            <Link
              href="/"
              onClick={closeMenus}
              className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-blue-50"
            >
              <Home size={18} />
              Home
            </Link>

            {/* Mobile courses accordion */}
            <div>
              <button
                type="button"
                onClick={() => setCoursesOpen((prev) => !prev)}
                aria-expanded={coursesOpen}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-blue-50"
              >
                <span className="flex items-center gap-3">
                  <BookOpen size={18} />
                  Courses
                </span>

                <ChevronDown
                  size={18}
                  className={`transition-transform ${coursesOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {coursesOpen && (
                <div className="ml-4 border-l-2 border-blue-100 pl-3">
                  {courseClasses.map((course) => (
                    <div key={course.slug}>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileOpenClass((prev) =>
                            prev === course.slug ? null : course.slug
                          )
                        }
                        aria-expanded={mobileOpenClass === course.slug}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {course.label}

                        <ChevronDown
                          size={16}
                          className={`transition-transform ${mobileOpenClass === course.slug
                            ? "rotate-180"
                            : ""
                            }`}
                        />
                      </button>

                      {mobileOpenClass === course.slug && (
                        <div className="mb-2 ml-3 space-y-1 border-l border-orange-200 pl-3">
                          {courseResources.map((resource) => {
                            const Icon = resource.icon;

                            return (
                              <Link
                                key={resource.slug}
                                href={`/courses/${course.slug}/${resource.slug}`}
                                onClick={closeMenus}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                              >
                                <Icon size={16} />
                                {resource.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(1).map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-blue-50"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}


            {/* {authLoading ? (
              <div className="mt-3 h-11 animate-pulse rounded-xl bg-slate-100" />
            ) : user ? (
              <Link
                href="/profile"
                onClick={closeMenus}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-bold text-white hover:bg-blue-800"
              >
                <FaUserCircle size={18} />
                Profile
              </Link>
            ) : (
              <Link
                href="#"
                onClick={closeMenus}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600"
              >
                <FaSignInAlt size={18} />
                Login / Register
              </Link>
            )} */}

            <div className="lg:hidden block">
              <Link
                href="#"
                onClick={closeMenus}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600"
              >
                <FaSignInAlt size={18} />
                Login / Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
