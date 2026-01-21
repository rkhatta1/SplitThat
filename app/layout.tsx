import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Playfair_Display, Kalam } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  weight: ["300", "400", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitThat - AI Utility for Splitwise",
  description: "Split expenses easily with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfairDisplay.variable} ${geistSans.variable} ${geistMono.variable} ${kalam.variable} scroll-smooth`}>
      <body className="antialiased no-scrollbar">
        {children}
      </body>
    </html>
  );
}
