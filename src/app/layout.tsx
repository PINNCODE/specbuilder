import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spec Builder",
  description: "Transform non-technical entrepreneurs' ideas into development-ready specs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}