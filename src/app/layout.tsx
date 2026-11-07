// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import ReduxProvider from "@/providers/ReduxProvider";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Coaching Platform",
//   description: "Learn, practice and prepare for your examinations.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body>
//         <ReduxProvider>{children}</ReduxProvider>
//       </body>
//     </html>
//   );
// }



import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import ReduxProvider from "@/providers/ReduxProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Accelerate Academy | Siwan (Bihar)",
  description: "Best Coaching in Siwan. Accelerate Academy Provides the best quality education for 6th to 12th grade students. We Provide with exclusive learning content for mathematics and science.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
