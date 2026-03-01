import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Builder",
  description: "Build professional resumes with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
