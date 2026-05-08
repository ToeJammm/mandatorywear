import type { Metadata } from "next";
import { Black_Ops_One, Oswald } from "next/font/google";
import "./globals.css";

const blackOps = Black_Ops_One({
  weight: "400",
  variable: "--font-black-ops",
  subsets: ["latin"],
});

const oswald = Oswald({
  weight: ["400", "500", "600"],
  variable: "--font-oswald",
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
    <html lang="en" className={`${blackOps.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-black text-[#f4f1eb]">
        {children}
      </body>
    </html>
  );
}
