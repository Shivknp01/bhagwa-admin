"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Users,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  X,
  Smartphone,
} from "lucide-react";
import { AppNotification, notificationRepository } from "@/repositories/notificationRepository";
import { cn } from "@/lib/utils";

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function formatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // notification id to delete
  const [pushingAgain, setPushingAgain] = useState<string | null>(null); // notification id being re-sent
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationRepository.getNotifications();
      setNotifications(data);
    } catch {
      showToast("Failed to load notification history", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    setDeletingId(id);
    try {
      await notificationRepository.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast("Notification deleted", "success");
    } catch {
      showToast("Failed to delete notification", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePushAgain = async (notification: AppNotification) => {
    setPushingAgain(notification.id);
    try {
      const result = await notificationRepository.pushAgain(notification);
      showToast(
        result.tokens > 0
          ? `🚩 Re-sent to ${formatCount(result.sent)} of ${formatCount(result.tokens)} devices!`
          : "📲 Notification saved. No devices registered yet.",
        "success"
      );
      // Refresh to show the new campaign row
      fetchNotifications();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to re-broadcast notification",
        "error"
      );
    } finally {
      setPushingAgain(null);
    }
  };

  return (
    <div className="space-y-6 select-none pb-16 max-w-6xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 max-w-sm",
            toastMessage.type === "success"
              ? "bg-[#FF7A00] text-white"
              : "bg-red-600 text-white"
          )}
        >
          {toastMessage.type === "success" ? (
            <Sparkles className="w-5 h-5 text-yellow-200 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Notification?</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  This will permanently remove this notification from history.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Push Notifications & Broadcasts
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Broadcast morning shlokas, evening aarti alerts, and festival reminders to all Daivik mobile users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            title="Refresh"
            className="p-2 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-[#FF7A00]")} />
          </button>
          <Link
            href="/notifications/create"
            className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast Notification</span>
          </Link>
        </div>
      </div>

      {/* NOTIFICATION HISTORY */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
            <p className="text-sm font-medium">Loading notification history...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <Bell className="w-10 h-10 text-[#FF7A00] mx-auto opacity-60" />
            <p className="text-base font-bold text-[var(--text-primary)]">No notifications sent yet</p>
            <p className="text-xs">Click Broadcast Notification to send your first alert.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {/* Header Row */}
            <div className="px-5 py-3 bg-[var(--bg-card)]/50 grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <div className="col-span-5">Notification</div>
              <div className="col-span-2 text-center">Audience</div>
              <div className="col-span-2 text-center">Sent</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-5 py-4 grid grid-cols-12 gap-2 items-center hover:bg-[var(--bg-card)]/40 transition-colors",
                  deletingId === n.id && "opacity-40 pointer-events-none"
                )}
              >
                {/* Notification Info */}
                <div className="col-span-5 flex items-start gap-3 min-w-0">
                  <div className="p-2.5 bg-[#FF7A00]/10 text-[#FF7A00] rounded-xl shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-[var(--text-primary)] truncate max-w-[220px]">
                        {n.title}
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-2.5 h-2.5" />
                        SENT
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 opacity-70">
                      {timeAgo(n.sentAt || n.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Audience */}
                <div className="col-span-2 text-center">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    {n.targetAudience === "premium" ? "Premium" : "All"}
                  </span>
                </div>

                {/* Stats */}
                <div className="col-span-2 text-center">
                  <div className="space-y-0.5">
                    {(n.recipientCount ?? 0) > 0 ? (
                      <>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {formatCount(n.recipientCount ?? 0)}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)]">devices</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-[var(--text-secondary)]">—</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-2">
                  {/* Push Again Button */}
                  <button
                    onClick={() => handlePushAgain(n)}
                    disabled={pushingAgain === n.id}
                    title="Push Again"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                      pushingAgain === n.id
                        ? "bg-[#FF7A00]/20 text-[#FF7A00] border-[#FF7A00]/30 cursor-wait"
                        : "bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/20 hover:bg-[#FF7A00]/20 active:scale-95"
                    )}
                  >
                    {pushingAgain === n.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Push Again</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirm(n.id)}
                    disabled={deletingId === n.id}
                    title="Delete"
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                  >
                    {deletingId === n.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner: Device Token Setup */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <Smartphone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-[var(--text-primary)]">
            How Push Notifications Work
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            When a user opens the Daivik app, their device registers its FCM token automatically.
            Broadcast reaches all registered devices. Tokens accumulate as more users install the app.
          </p>
        </div>
      </div>
    </div>
  );
}
