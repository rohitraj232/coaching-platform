
// import Link from "next/link";
// import { Home, ArrowLeft } from "lucide-react";

// export default function NotFound() {
//   return (
//     <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
//       <div className="max-w-xl w-full text-center">

//         <h1 className="text-9xl font-extrabold text-blue-600">
//           404
//         </h1>

//         <h2 className="mt-4 text-3xl font-bold text-slate-900">
//           Page Not Found
//         </h2>

//         <p className="mt-4 text-slate-500 text-lg">
//           Sorry! The page you are looking for doesn't exist
//           or may have been moved.
//         </p>

//         <div className="mt-8 flex flex-wrap justify-center gap-4">

//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
//           >
//             <Home size={18} />
//             Back to Home
//           </Link>

//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
//           >
//             <ArrowLeft size={18} />
//             Return Home
//           </Link>

//         </div>
//       </div>
//     </main>
//   );
// }


import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function ComingSoon() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-7xl text-center">

        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
          <Sparkles size={38} />
        </div>

        {/* Heading */}
        <span className="inline-block rounded-full bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-600">
          Something Exciting Is Coming
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Something Great <span className="text-blue-600">Is Coming!</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
          We are working behind the scenes to bring you
          an amazing learning experience. This page is
          currently under development, but exciting
          things are on their way.
        </p>

        <p className="mt-3 text-sm font-medium text-slate-700">
          Stay tuned — your learning journey is about
          to get even better!
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-700"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:-translate-y-1 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Explore Website
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Accelerate Academy | Siwan (Bihar).
            All rights reserved.
          </p>
        </div>

      </div>
    </main>
  );
}

