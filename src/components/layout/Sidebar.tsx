"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Rss,
  TrendingUp,
  CreditCard,
  Bell,
  Share2,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Content", href: "/content", icon: FolderKanban },
  { label: "Feed", href: "/feed", icon: Rss },
  { label: "Engagement", href: "/engagement", icon: TrendingUp },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Referrals", href: "/referrals", icon: Share2 },
  { label: "Moderation", href: "/moderation", icon: ShieldAlert },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r transition-all duration-300 select-none z-30",
        "bg-[var(--bg-card)] border-[var(--border-color)]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header & Brand Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <img
            src="/daivik_logo.png"
            alt="Daivik"
            className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-[#FF7A00]/30 shrink-0 shadow-xs"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[var(--text-primary)] leading-none tracking-tight">
                Daivik
              </span>
              <span className="text-[10px] text-[#FF7A00] font-bold tracking-wider uppercase mt-0.5">
                Admin Panel
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group",
                isActive
                  ? "bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/25"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "")} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[var(--border-color)]">
        {!collapsed ? (
          <div className="text-xs text-[var(--text-secondary)] flex flex-col gap-1">
            <span className="font-semibold text-[var(--text-primary)]">Bhagwa Admin v1.0</span>
            <span>Frontend Preview Ready</span>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" title="System Online" />
        )}
      </div>
    </aside>
  );
}
