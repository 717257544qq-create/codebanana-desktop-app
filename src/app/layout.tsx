import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeBanana Desktop App",
  description: "AI-powered desktop application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}