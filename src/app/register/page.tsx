
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  title: string;
  class_level: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    classLevel: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch active classes dynamically
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("courses")
          .select("id, title, class_level")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Courses fetch error:", error);
          setError("Unable to load classes. Please refresh the page.");
          return;
        }

        setCourses(data ?? []);
      } catch (err) {
        console.error("Courses fetch error:", err);
        setError("Unable to load classes. Please refresh the page.");
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!courses.some((course) => course.class_level === form.classLevel)) {
      setError("Please select a valid class.");
      return;
    }

    try {
      setLoading(true);

      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim(),
            class_level: form.classLevel,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (!data.user) {
        setError("Unable to create your account. Please try again.");
        return;
      }

      if (data.session) {
        router.replace("/");
        router.refresh();
      } else {
        setSuccess(
          "Registration successful! Please verify your email. You can log in after verification."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#173c85] focus:bg-white focus:ring-4 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-[#EAF0F8] p-3 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70 sm:min-h-[calc(100vh-48px)] lg:grid-cols-2">

        {/* LEFT - REGISTRATION FORM */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-lg">

            {/* LOGO */}
            <Link href="/" className="mb-8 inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Accelerate Academy"
                width={68}
                height={68}
                className="h-14 w-14 rounded-full object-contain"
                priority
              />

              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-[#102f70]">
                  Accelerate <span className="text-orange-500">Academy</span>
                </h2>
                <p className="text-xs font-medium tracking-wide text-slate-500">
                  SIWAN, BIHAR
                </p>
              </div>
            </Link>

            {/* HEADING */}
            <div className="mb-7">
              <span className="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#b31012]">
                Student Registration
              </span>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Create Your{" "}
                <span className="text-[#b31012]">Account</span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Join Accelerate Academy and start your learning journey
                with expert guidance and quality education.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* FULL NAME */}
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              {/* EMAIL & PHONE */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    required
                    autoComplete="tel"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* DYNAMIC CLASS */}
              <div>
                <label htmlFor="classLevel" className={labelClass}>
                  Select Class
                </label>

                <select
                  id="classLevel"
                  name="classLevel"
                  value={form.classLevel}
                  onChange={handleChange}
                  required
                  disabled={coursesLoading || courses.length === 0}
                  className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <option value="">
                    {coursesLoading
                      ? "Loading classes..."
                      : "Choose your class"}
                  </option>

                  {courses.map((course) => (
                    <option key={course.id} value={course.class_level}>
                      Class {course.class_level}
                    </option>
                  ))}
                </select>

                {!coursesLoading && courses.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    No active classes available. Please try again later.
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600">
                  {error}
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
                  {success}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || coursesLoading || courses.length === 0}
                className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#b31012] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#941012] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Creating Account..." : "Create Your Account"}

                {!loading && (
                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#b31012] transition hover:text-[#173c85]"
                >
                  Login
                </Link>
              </p>
            </div>

            {/* FOOTER */}
            <div className="mt-8 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} Accelerate Academy. All rights reserved.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT - TEACHER IMAGE PANEL */}
        <section className="relative hidden min-h-full overflow-hidden bg-[#102f70] lg:block">

          {/* BACKGROUND DECORATION */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[50px] border-white/5" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full border-[50px] border-white/5" />

          {/* TEACHER IMAGE */}
          <div className="absolute inset-0">
            <Image
              src="/images/teacher/main.png"
              alt="Accelerate Academy teacher"
              fill
              priority
              sizes="50vw"
              className="object-cover object-top"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#071a43]/95 via-[#102f70]/30 to-[#102f70]/10" />
          </div>

          {/* RIGHT PANEL CONTENT */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">

            <div className="flex justify-end">
              <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
                LEARN • GROW • SUCCEED
              </span>
            </div>

            <div className="max-w-lg pb-5">
              <div className="mb-5 h-1.5 w-16 rounded-full bg-[#e23a3d]" />

              <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-5xl">
                Build Your Future
                <br />
                <span className="text-red-300">
                  With the Right Guidance.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-blue-100 xl:text-base">
                Get access to expert teachers, structured courses,
                quality study materials and interactive learning
                experiences.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  Expert Faculty
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  Live Classes
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  Study Materials
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE TEACHER IMAGE */}
        <section className="relative h-[400px] overflow-hidden bg-[#102f70] lg:hidden sm:h-80">
          <Image
            src="/images/teacher/main.png"
            alt="Accelerate Academy teacher"
            fill
            sizes="100vw"
            className="object-cover object-top"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#102f70]/90 via-[#102f70]/20 to-transparent" />

          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-xl font-extrabold text-white">
              Build Your Future With Us.
            </p>

            <p className="mt-1 text-xs text-blue-100">
              Learn • Grow • Succeed with Accelerate Academy
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
