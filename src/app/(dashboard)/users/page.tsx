import React from "react";

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users Management</h1>
      <p className="text-sm text-[var(--text-secondary)]">
        Manage registered devotees, active users, user activity timelines, and subscription statuses.
      </p>
      <div className="p-8 border border-dashed border-[var(--border-color)] rounded-2xl text-center text-[var(--text-secondary)]">
        Users table & filters placeholder (Phase 3)
      </div>
    </div>
  );
}
