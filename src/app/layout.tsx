import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { display, text } from "@/ui/fonts";
import "@/ui/tokens.css";

export const metadata: Metadata = {
  title: { default: "EBC Title Race", template: "%s · EBC Title Race" },
  description: "2026 EB-CT championship rankings: where you stand and what November can change.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171a1f" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
