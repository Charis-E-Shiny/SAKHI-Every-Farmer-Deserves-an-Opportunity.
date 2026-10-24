// Root layout: fonts (Latin + Devanagari + Kannada for the farmer UI),
// global providers, metadata and mobile viewport settings.
import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
} from "next/font/google";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});
const deva = Noto_Sans_Devanagari({
  variable: "--font-deva",
  subsets: ["devanagari"],
  preload: false,
});
const knda = Noto_Sans_Kannada({ variable: "--font-knda", subsets: ["kannada"], preload: false });

export const metadata: Metadata = {
  title: { default: "FoodFlow — From every harvest to every table", template: "%s · FoodFlow" },
  description:
    "AI-assisted fresh-produce marketplace connecting farmers directly with households, restaurants and community kitchens. Built for UN SDG 2 — Zero Hunger.",
  applicationName: "FoodFlow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1611" },
  ],
};

/**
 * Root HTML shell shared by every route.
 * @param children - active route segment
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${instrument.variable} ${deva.variable} ${knda.variable} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
