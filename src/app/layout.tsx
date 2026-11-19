import type { Metadata } from "next";
import { Poppins } from "next/font/google";
// import ReduxProvider from "@/providers/ReduxProvider";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
        {/* <Navbar /> */}
        {/* <ReduxProvider>{children}</ReduxProvider> */}
        {children}

        {/* <Footer /> */}
      </body>
    </html>
  );
}
