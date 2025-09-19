import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ReduxProvider from "@/providers/ReduxProvider";
import { Directions, Languages, Locale } from "@/constants/enums";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Ordering App",
  description: "A food ordering experience with Next.js + Tailwind",
};

export async function generateStaticParams() {
  return [{ locale: Languages.ARABIC }, { locale: Languages.ENGLISH }];
}

export default function RootLayout({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const { locale } = params;

  return (
    <html
      lang={locale}
      dir={locale === Languages.ARABIC ? Directions.RTL : Directions.LTR}
    >
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          bg-white text-black min-h-screen h-full antialiased
          dark:bg-black dark:text-white
        `}
      >
        <ReduxProvider>
          <Header />
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
