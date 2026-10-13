import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";

export const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const text = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-text",
  display: "swap",
});
