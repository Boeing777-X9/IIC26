import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retinix — Distributed Retinal Screening & Tele-Triage Platform",
  description: "Explainable AI-assisted screening for diabetic retinopathy in rural healthcare camps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
