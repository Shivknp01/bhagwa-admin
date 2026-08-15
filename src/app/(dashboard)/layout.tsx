"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { ThemeProvider } from "@/lib/themeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Application Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
