import type { Metadata } from "next";
import { Navbar } from "@/components/common/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amrita Curriculum Assistant",
  description:
    "AI-powered curriculum information system for Amrita Vishwa Vidyapeetham",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
