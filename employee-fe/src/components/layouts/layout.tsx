"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const visibleLayoutRoutes = ["/", "/about"];
  const shouldShowLayout = visibleLayoutRoutes.includes(pathname);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex flex-col min-h-screen">
        <main className={`flex-grow ${shouldShowLayout ? "px-6 py-4" : ""}`}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
