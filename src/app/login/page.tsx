
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const isDeactivated =
//     searchParams.get("error") === "account_deactivated";

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     setError("");
//     setLoading(true);

//     try {
//       const supabase = createClient();

//       const { data, error: loginError } =
//         await supabase.auth.signInWithPassword({
//           email: email.trim(),
//           password,
//         });

//       if (loginError) {
//         setError(
//           loginError.message === "Invalid login credentials"
//             ? "Incorrect email or password."
//             : loginError.message
//         );
//         return;
//       }

//       if (!data.user || !data.session) {
//         setError("Unable to establish your login session.");
//         return;
//       }

//       // Verify login session.
//       const { data: userData, error: userError } =
//         await supabase.auth.getUser();

//       if (userError || !userData.user) {
//         setError("Login successful, but session verification failed.");
//         return;
//       }

//       // Verify account status and role.
//       const { data: profile, error: profileError } = await supabase
//         .from("profiles")
//         .select("role, is_active")
//         .eq("id", userData.user.id)
//         .maybeSingle();

//       if (profileError || !profile) {
//         await supabase.auth.signOut();
//         setError("Unable to verify your account. Please contact support.");
//         return;
//       }

//       if (profile.role === "student" && !profile.is_active) {
//         await supabase.auth.signOut();
//         setError(
//           "Your account has been deactivated by the administrator. Please contact the coaching institute."
//         );
//         return;
//       }

//       // Clear old query message and redirect.
//       router.replace("/");
//       router.refresh();
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
//       <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//         <div className="mb-8 text-center">
//           <h1 className="text-2xl font-bold text-slate-900">
//             Welcome Back!
//           </h1>

//           <p className="mt-2 text-sm text-slate-500">
//             Login to access your courses and quizzes.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label
//               htmlFor="email"
//               className="mb-2 block text-sm font-medium text-slate-700"
//             >
//               Email Address
//             </label>

//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               autoComplete="email"
//               required
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-2 block text-sm font-medium text-slate-700"
//             >
//               Password
//             </label>

//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 autoComplete="current-password"
//                 required
//                 className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
//               >
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//           </div>

//           {/* Deactivated account message */}
//           {isDeactivated && (
//             <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//               Your account has been deactivated by the administrator.
//               Please contact the coaching institute for assistance.
//             </div>
//           )}

//           {/* Login error */}
//           {error && (
//             <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-slate-600">
//           Don't have an account?{" "}
//           <Link
//             href="/register"
//             className="font-semibold text-blue-600 hover:underline"
//           >
//             Register
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }



"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDeactivated =
    searchParams.get("error") === "account_deactivated";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(
          loginError.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : loginError.message
        );
        return;
      }

      if (!data.user || !data.session) {
        setError("Unable to establish your login session.");
        return;
      }

      // Verify login session.
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError("Login successful, but session verification failed.");
        return;
      }

      // Verify account status and role.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("Unable to verify your account. Please contact support.");
        return;
      }

      if (profile.role === "student" && !profile.is_active) {
        await supabase.auth.signOut();
        setError(
          "Your account has been deactivated by the administrator. Please contact the coaching institute."
        );
        return;
      }

      // Clear old query message and redirect.
      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E8F1FF] p-3 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70 sm:min-h-[calc(100vh-48px)] lg:grid-cols-2">

        {/* LEFT - LOGIN FORM */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">

            {/* LOGO */}
            <Link href="/" className="mb-10 inline-flex items-center gap-3">
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
            <div className="mb-8">
              <span className="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#b31012]">
                Student Portal
              </span>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Welcome <span className="text-[#b31012]">Back!</span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Login to continue your learning journey and access your
                courses, study materials and quizzes.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#173c85] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#173c85] focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#173c85] transition hover:text-[#b31012]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* DEACTIVATED ACCOUNT MESSAGE */}
              {isDeactivated && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  Your account has been deactivated by the administrator.
                  Please contact the coaching institute for assistance.
                </div>
              )}

              {/* LOGIN ERROR */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600">
                  {error}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#b31012] px-5 py-4 text-sm cursor-pointer font-bold text-white shadow-lg shadow-red-900/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#941012] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Logging in..." : "Login to Your Account"}

                {!loading && (
                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#b31012] transition hover:text-[#173c85]"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* FOOTER */}
            <div className="mt-10 border-t border-slate-100 pt-5 text-center">
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

          {/* IMAGE */}
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

          {/* CONTENT */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">

            <div className="flex justify-end">
              <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
                LEARN • GROW • SUCCEED
              </span>
            </div>

            <div className="max-w-lg pb-5">
              <div className="mb-5 h-1.5 w-16 rounded-full bg-[#e23a3d]" />

              <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-5xl">
                Your Success
                <br />
                <span className="text-red-300">Starts Here.</span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-blue-100 xl:text-base">
                Learn from experienced teachers, strengthen your concepts
                and prepare confidently for your academic goals.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  Expert Faculty
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  Live Classes
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  Quality Education
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE TEACHER IMAGE */}
        <section className="relative h-100 overflow-hidden bg-[#102f70] lg:hidden sm:h-80">
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
              Your Success Starts Here.
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
