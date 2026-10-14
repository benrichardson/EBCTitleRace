import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { display, text, wordmark } from "@/ui/fonts";
import "@/ui/tokens.css";

export const metadata: Metadata = {
  title: { default: "EBC Title Race", template: "%s · EBC Title Race" },
  description: "2026 EB-CT championship rankings: where you stand and what November can change.",
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${text.variable} ${wordmark.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
