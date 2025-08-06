import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Food Ordering App",
  description: "A food ordering experience with Next.js + Tailwind",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          bg-white text-black min-h-screen h-full antialiased
          dark:bg-black dark:text-white
        `}
      >
            <Header />
            {children}
            <Footer />
        
      </body>
    </html>
  );
}
