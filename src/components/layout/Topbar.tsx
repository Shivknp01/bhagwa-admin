"use client";

import React, { useState } from "react";
import { Search, Bell, Moon, Sun, Menu, UserCheck, LogOut } from "lucide-react";
import { useTheme } from "@/lib/themeContext";

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Toggle & Global Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg lg:hidden text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search users, posts, transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/50 transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Notifications, Theme Switch, Admin Dropdown */}
      <div className="flex items-center gap-2">
        {/* Notifications Icon Button */}
        <button
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7A00] rounded-full ring-2 ring-[var(--bg-card)]" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="h-6 w-[1px] bg-[var(--border-color)] mx-1" />

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <img
              src="https://i.pravatar.cc/150?img=68"
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FF7A00]"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[var(--text-primary)]">Aditya Sharma</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Super Admin</span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl py-2 z-50 text-sm">
              <div className="px-4 py-2 border-b border-[var(--border-color)]">
                <p className="font-bold text-[var(--text-primary)]">Aditya Sharma</p>
                <p className="text-xs text-[var(--text-secondary)]">admin@bhagwa.app</p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]"
              >
                <UserCheck className="w-4 h-4 text-[#FF7A00]" />
                Profile Settings
              </button>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 text-rose-500 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
