import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";

/**
 * The layout for all user-authenticated pages (dashboard, settings, etc.).
 * It includes the main navigation bar and a main content area.
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The page content to be rendered within the layout.
 * @returns {JSX.Element} The user layout structure.
 */
export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="bg-content">{children}</main>
    </div>
  );
}
