"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Send, Smartphone, Sparkles, X } from "lucide-react";
import { notificationRepository } from "@/repositories/notificationRepository";

export default function CreateNotificationPage() {
  const router = useRouter();

  const [title, setTitle] = useState("🌅 Shravan Somvar Mahadev Aarti & Wallpapers");
  const [body, setBody] = useState("Receive divine blessings today with HD Mahadev Wallpapers and morning Aarti audio in Daivik.");
  const [imageUrl, setImageUrl] = useState("");
  const [actionUrl, setActionUrl] = useState("bhagwa://category/Wallpaper");
  const [targetAudience, setTargetAudience] = useState<"all" | "premium" | "free">("all");
  const [submitting, setSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Title and Message Body are required");
      return;
    }

    setSubmitting(true);
    try {
      await notificationRepository.sendNotification({
        title,
        body,
        imageUrl: imageUrl || undefined,
        actionUrl: actionUrl || undefined,
        targetAudience,
        status: "sent",
      });

      router.push("/notifications");

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error broadcasting notification";
      console.error("Broadcast notification error:", err);
      alert(`Error broadcasting notification: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none pb-16">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="p-2 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Broadcast Push Notification
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Send instant push alert to Daivik mobile app users.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
          >
            <Smartphone className="w-4 h-4 text-[#FF7A00]" />
            <span>Mobile Preview</span>
          </button>
          <button
            disabled={submitting}
            onClick={handleSend}
            className="inline-flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send Now 🚩</span>
          </button>
        </div>
      </div>

      {/* COMPOSER FORM */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl space-y-5 shadow-xs">
        <div>
          <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Notification Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Message Body *</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Banner Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Deep Link / Action URL</label>
            <input
              type="text"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Target Audience</label>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="radio"
                name="audience"
                checked={targetAudience === "all"}
                onChange={() => setTargetAudience("all")}
                className="text-[#FF7A00] focus:ring-[#FF7A00]"
              />
              <span>All Registered Devotees</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="radio"
                name="audience"
                checked={targetAudience === "premium"}
                onChange={() => setTargetAudience("premium")}
                className="text-[#FF7A00] focus:ring-[#FF7A00]"
              />
              <span>Premium Subscribers Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* MOBILE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
                Android System Alert Preview
              </span>
            </div>

            {/* Android Push Banner */}
            <div className="w-full bg-[#1A120B] text-white p-4 rounded-2xl border border-white/20 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <div className="flex items-center gap-1.5">
                  <img src="/daivik_logo.png" alt="Daivik" className="w-4 h-4 rounded-full" />
                  <span className="font-bold text-[#FF7A00]">Daivik — Bhakti</span>
                </div>
                <span>Just now</span>
              </div>
              <h4 className="font-bold text-xs text-white">{title}</h4>
              <p className="text-xs text-white/80 line-clamp-3">{body}</p>
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)]"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
