import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "@/components/layout/ClientProviders";
import ThemeRegistry from "@/lib/registry";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flashcard Engine",
  description: "Spaced repetition flashcards powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 dark:bg-surface-dark">
        <ThemeRegistry>
          <ClientProviders>
            {children}
            {/* TODO: Render <Toaster /> from toast context once implemented. */}
          </ClientProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}
