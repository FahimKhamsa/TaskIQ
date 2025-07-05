import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

const inter = Inter({ subsets: ["latin"] });

// Metadata for the application, which helps with SEO and browser tab information.
export const metadata: Metadata = {
  title: "TaskIQ",
  description: "Intelligent Task Management for Modern Teams",
};

/**
 * RootLayout is the main layout for the entire application.
 * It wraps all pages and includes the basic <html> and <body> structure.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The root layout structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {/* The Providers component wraps all client-side context providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
