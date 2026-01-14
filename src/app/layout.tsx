import type { Metadata } from "next";
import { Prompt, Sarabun } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
});

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "Teacher Pongdee PA Portfolio",
  description: "Digital Performance Agreement Portfolio",
};

import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${prompt.variable} ${sarabun.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <SiteSettingsProvider>
            {children}
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
