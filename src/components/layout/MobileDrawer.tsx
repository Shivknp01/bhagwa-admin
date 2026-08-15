"use client";

import React from "react";
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
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
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

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[80vw] bg-[var(--bg-card)] border-r border-[var(--border-color)] h-full flex flex-col z-10 shadow-2xl">
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF7A00] flex items-center justify-center text-white font-bold">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-base text-[var(--text-primary)]">BHAGWA ADMIN</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all",
                  isActive
                    ? "bg-[#FF7A00] text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
