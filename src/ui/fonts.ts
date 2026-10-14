import { Anton, Inter } from "next/font/google";
import localFont from "next/font/local";

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

// Victory Comics 3D Semi-Italic (Iconian Fonts): free for non-commercial use. Licence: fonts/victory-comics-LICENSE.txt
export const wordmark = localFont({
  src: "./fonts/victory-comics-3d-semi-italic.ttf",
  variable: "--font-wordmark",
  display: "swap",
  adjustFontFallback: false,
  // Pin vertical metrics to the glyph ink (caps top 672, 3D shadow bottom -48, per 1000 units) so every browser
  // lays the line out identically and the shadow's bottom is the bottom of the text box.
  declarations: [
    { prop: "ascent-override", value: "67.2%" },
    { prop: "descent-override", value: "4.8%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});
