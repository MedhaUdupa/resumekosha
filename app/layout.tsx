import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeKosha — AI-Powered ATS & Career Coach",
  description:
    "Semantic ATS scoring, blind spot detection, trust scoring, and AI career coaching for students and recruiters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
