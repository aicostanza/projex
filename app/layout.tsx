import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project X — Your gaming workspace",
  description: "Explore champions, understand your matches, and keep your cosmetic collection together. A League-first Project X prototype.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="blue">
      <body className="antialiased">{children}</body>
    </html>
  );
}
