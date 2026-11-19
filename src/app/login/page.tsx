
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


import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#E8F1FF]">
          <p className="text-sm font-medium text-slate-600">
            Loading login page...
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
