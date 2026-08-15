"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  comparisonText?: string;
  icon: React.ElementType;
  iconBgColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  comparisonText = "vs previous period",
  icon: Icon,
  iconBgColor = "bg-[#FF7A00]/10 text-[#FF7A00]",
}: StatCardProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {title}
        </span>
        <div className={cn("p-2.5 rounded-xl shrink-0", iconBgColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {value}
        </h3>
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md",
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-[var(--text-secondary)]">{comparisonText}</p>
    </div>
  );
}
