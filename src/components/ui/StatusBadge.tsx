"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let styles = "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";

  if (["published", "active", "success"].includes(normalized)) {
    styles = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (["draft", "pending"].includes(normalized)) {
    styles = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  } else if (["scheduled"].includes(normalized)) {
    styles = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  } else if (["banned", "failed", "deleted", "hidden"].includes(normalized)) {
    styles = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  } else if (["refunded", "cancelled", "archived"].includes(normalized)) {
    styles = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide",
        styles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {status}
    </span>
  );
}
