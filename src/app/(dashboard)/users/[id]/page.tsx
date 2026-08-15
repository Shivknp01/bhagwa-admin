import React from "react";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Profile Details</h1>
      <p className="text-sm text-[var(--text-secondary)]">User ID: {params?.id || "user_101"}</p>
      <div className="p-8 border border-dashed border-[var(--border-color)] rounded-2xl text-center text-[var(--text-secondary)]">
        User Profile, Engagement History & Activity Log (Phase 3)
      </div>
    </div>
  );
}
