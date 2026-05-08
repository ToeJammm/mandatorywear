import type { Metadata } from "next";
import { Black_Ops_One, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const blackOps = Black_Ops_One({
  weight: "400",
  variable: "--font-black-ops",
  subsets: ["latin"],
});

const barlow = Barlow_Condensed({
  weight: ["300", "400", "600"],
  variable: "--font-barlow",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MANDATORY WEAR",
  description: "Limited drops. No excess.",
  openGraph: {
    title: "MANDATORY WEAR",
    description: "Limited drops. No excess.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${blackOps.variable} ${barlow.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-black text-[#f4f1eb]">
        {children}
      </body>
    </html>
  );
}
