import React from "react";

export default function ContentPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Content Management</h1>
      <p className="text-sm text-[var(--text-secondary)]">
        Manage wallpapers, bhajans, ringtones, mantras, stutis, horoscopes, and status cards.
      </p>
      <div className="p-8 border border-dashed border-[var(--border-color)] rounded-2xl text-center text-[var(--text-secondary)]">
        Content Table, Filters & Bulk Actions Placeholder (Phase 4)
      </div>
    </div>
  );
}
