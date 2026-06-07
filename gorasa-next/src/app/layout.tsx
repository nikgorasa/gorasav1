import type { Metadata } from "next";
import { Inter, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "GoRASA — Premium Travel & Luxury Hotel Bookings",
  description:
    "Premium travel booking platform. Fine airfare, luxury hotels, and curated holiday packages across India and the world.",
  keywords: [
    "travel",
    "flights",
    "hotels",
    "holiday packages",
    "luxury travel",
    "India",
  ],
  openGraph: {
    title: "GoRASA — Experience The Finest",
    description:
      "Premium travel booking platform for luxury flights, hotels, and curated holiday packages.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#F97316" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900 antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
