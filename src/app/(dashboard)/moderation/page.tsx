import React from "react";

export default function ModerationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Community Moderation</h1>
      <p className="text-sm text-[var(--text-secondary)]">Review flagged reports, inappropriate comments, spam links, and user bans.</p>
      <div className="p-8 border border-dashed border-[var(--border-color)] rounded-2xl text-center text-[var(--text-secondary)]">
        Moderation Queue & Flagged Content Placeholder (Phase 10)
      </div>
    </div>
  );
}
