import { Anton, Bungee, Inter } from "next/font/google";

export const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const text = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-text",
  display: "swap",
});

// Masthead wordmark: Bungee, with the 3D outline/shadow and slant applied in shell.module.css.
export const wordmark = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wordmark",
  display: "swap",
});
