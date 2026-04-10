import type { Metadata } from "next";
import { Fraunces, DM_Sans, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Analytics } from "@vercel/analytics/next";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nourishbox — Nutrition Premium",
  description:
    "Votre compagnon nutritionnel personnalisé — livraison de repas santé à Tanger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable} ${cairo.variable}`}>
      <body className="bg-background text-text-primary font-sans antialiased min-h-screen leading-relaxed">
          <ScrollProgress />
          <CustomCursor />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: "var(--color-text-primary)",
                boxShadow: "var(--shadow-card)",
              },
            }}
          />
          <Analytics />
      </body>
    </html>
  );
}
