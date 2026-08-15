import React from "react";

export default function EditContentPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Content</h1>
      <p className="text-sm text-[var(--text-secondary)]">ID: {params?.id || "post_1"}</p>
      <div className="p-8 border border-dashed border-[var(--border-color)] rounded-2xl text-center text-[var(--text-secondary)]">
        Edit Content Form Placeholder (Phase 4)
      </div>
    </div>
  );
}
