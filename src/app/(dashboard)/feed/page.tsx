import React from "react";

export default function FeedPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Feed Management & Mobile Order</h1>
      <p className="text-sm text-[var(--text-secondary)]">
        Control the exact order, featured items, pinned posts, and scheduled feeds in the Bhagwa mobile app.
      </p>
      <div className="p-8 border border-dashed border-[var(--border-color)] rounded-2xl text-center text-[var(--text-secondary)]">
        Drag-and-Drop Feed Reordering & Pinning Placeholder (Phase 5)
      </div>
    </div>
  );
}
