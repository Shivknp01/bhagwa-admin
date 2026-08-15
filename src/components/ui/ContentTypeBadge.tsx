"use client";

import React from "react";
import { ContentType } from "@/models/post";
import { cn } from "@/lib/utils";

interface ContentTypeBadgeProps {
  type: ContentType | string;
  className?: string;
}

const typeMap: Record<string, { emoji: string; label: string }> = {
  wallpaper: { emoji: "🖼", label: "Wallpaper" },
  video: { emoji: "🎬", label: "Video" },
  music: { emoji: "🎵", label: "Music" },
  bhajan: { emoji: "🙏", label: "Bhajan" },
  ringtone: { emoji: "🔔", label: "Ringtone" },
  mantra: { emoji: "🕉", label: "Mantra" },
  stuti: { emoji: "📖", label: "Stuti" },
  status: { emoji: "📱", label: "Status" },
  horoscope: { emoji: "🔮", label: "Horoscope" },
};

export function ContentTypeBadge({ type, className }: ContentTypeBadgeProps) {
  const normalized = type.toLowerCase();
  const item = typeMap[normalized] || { emoji: "📄", label: type };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20",
        className
      )}
    >
      <span>{item.emoji}</span>
      <span>{item.label}</span>
    </span>
  );
}
