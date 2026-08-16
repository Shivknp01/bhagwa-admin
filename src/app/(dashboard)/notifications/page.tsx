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
  Clock,
  Info,
  Smartphone,
  CheckCheck,
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pushingAgain, setPushingAgain] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
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
      showToast("Notification deleted from history", "success");
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
          ? `🚩 Push sent to ${formatCount(result.sent)} of ${formatCount(result.tokens)} device(s)!`
          : "📲 Campaign broadcasted to In-App feed. (0 FCM tokens registered)",
        "success"
      );
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

  const renderStatusBadge = (status: AppNotification["status"]) => {
    switch (status) {
      case "delivered":
        return (
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <CheckCheck className="w-3 h-3" /> DELIVERED
          </span>
        );
      case "sent":
        return (
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3 h-3" /> SENT
          </span>
        );
      case "scheduled":
        return (
          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" /> SCHEDULED
          </span>
        );
      case "failed":
        return (
          <span className="text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" /> DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-none pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 max-w-md",
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
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Notification?</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  This will permanently delete this notification from history.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
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
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Push Notifications & Broadcast History
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track broadcast delivery status, FCM push metrics, and re-push alerts to Daivik app users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            title="Refresh History"
            className="p-2.5 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
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

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Broadcasts</p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{notifications.length}</p>
          </div>
          <div className="p-3 bg-[#FF7A00]/10 text-[#FF7A00] rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Successful Deliveries</p>
            <p className="text-xl font-extrabold text-emerald-500 mt-0.5">
              {notifications.filter((n) => n.status === "delivered" || n.status === "sent").length}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Audience</p>
            <p className="text-xl font-extrabold text-blue-500 mt-0.5">All Devotees</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NOTIFICATION HISTORY TABLE */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
            <p className="text-sm font-medium">Fetching broadcast history from database...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <Bell className="w-10 h-10 text-[#FF7A00] mx-auto opacity-60" />
            <p className="text-base font-bold text-[var(--text-primary)]">No notifications in history</p>
            <p className="text-xs">Click Broadcast Notification above to send your first push alert.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {/* Header Row */}
            <div className="px-5 py-3 bg-[var(--bg-card)]/60 grid grid-cols-12 gap-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)]">
              <div className="col-span-5">Notification Details</div>
              <div className="col-span-2 text-center">Status & Reason</div>
              <div className="col-span-2 text-center">Audience & Devices</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-5 py-4 grid grid-cols-12 gap-3 items-center hover:bg-[var(--bg-card)]/40 transition-colors",
                  deletingId === n.id && "opacity-40 pointer-events-none"
                )}
              >
                {/* Notification Info */}
                <div className="col-span-5 flex items-start gap-3 min-w-0">
                  <div className="p-2.5 bg-[#FF7A00]/10 text-[#FF7A00] rounded-xl shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] leading-tight">
                      {n.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--text-secondary)] opacity-75 pt-0.5">
                      Sent: {timeAgo(n.sentAt || n.createdAt)} • {new Date(n.sentAt || n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status & Delivery Reason */}
                <div className="col-span-2 flex flex-col items-center justify-center space-y-1 text-center">
                  {renderStatusBadge(n.status)}
                  {n.statusReason && (
                    <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] max-w-[140px] truncate" title={n.statusReason}>
                      <Info className="w-3 h-3 text-[#FF7A00] shrink-0" />
                      <span className="truncate">{n.statusReason}</span>
                    </div>
                  )}
                </div>

                {/* Audience & Device Count */}
                <div className="col-span-2 text-center space-y-1">
                  <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    {n.targetAudience === "premium" ? "Premium" : "All Devotees"}
                  </span>
                  <p className="text-xs font-extrabold text-[var(--text-primary)]">
                    {(n.recipientCount ?? 0) > 0 ? `${formatCount(n.recipientCount ?? 0)} devices` : "Feed Broadcast"}
                  </p>
                </div>

                {/* Actions: Push Again & Delete */}
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handlePushAgain(n)}
                    disabled={pushingAgain === n.id}
                    title="Push Notification Again via FCM"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border shadow-xs",
                      pushingAgain === n.id
                        ? "bg-[#FF7A00]/20 text-[#FF7A00] border-[#FF7A00]/30 cursor-wait"
                        : "bg-[#FF7A00] hover:bg-[#E66E00] text-white border-[#FF7A00] active:scale-95"
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

                  <button
                    onClick={() => setDeleteConfirm(n.id)}
                    disabled={deletingId === n.id}
                    title="Delete Notification"
                    className="p-2 text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
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

      {/* FOOTER INFO BANNER */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl flex items-start gap-3 shadow-xs">
        <Smartphone className="w-5 h-5 text-[#FF7A00] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
            Delivery Status & Diagnostics Guide
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            • <strong>DELIVERED</strong>: FCM push delivered to target Android device status bar and saved in app feed.<br />
            • <strong>SENT</strong>: Campaign broadcasted to Supabase Realtime in-app feed.<br />
            • <strong>Push Again</strong>: Triggers immediate re-broadcast to all registered devices.<br />
            • <strong>Delete</strong>: Permanently purges record from notification history.
          </p>
        </div>
      </div>
    </div>
  );
}
