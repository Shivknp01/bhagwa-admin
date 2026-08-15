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
  Calendar,
  Sparkles,
} from "lucide-react";
import { AppNotification, notificationRepository } from "@/repositories/notificationRepository";
import { cn } from "@/lib/utils";

function formatMetric(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationRepository.getNotifications();
      setNotifications(data);
    } catch {
      showToast("Error loading notifications from database");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = async (id: string) => {
    try {
      await notificationRepository.deleteNotification(id);
      showToast("Notification deleted");
      fetchNotifications();
    } catch {
      showToast("Error deleting notification");
    }
  };

  return (
    <div className="space-y-6 select-none pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FF7A00] text-white px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-5 h-5 text-yellow-200 shrink-0" />
          <span>{toastMessage}</span>
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

      {/* LIST OF SENT & SCHEDULED NOTIFICATIONS */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
            <p className="text-sm font-medium">Fetching notifications from Supabase...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <Bell className="w-10 h-10 text-[#FF7A00] mx-auto opacity-60" />
            <p className="text-base font-bold text-[var(--text-primary)]">No notifications broadcasted yet</p>
            <p className="text-xs">Click Broadcast Notification to send your first alert.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {notifications.map((n) => (
              <div key={n.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-card)]/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#FF7A00]/10 text-[#FF7A00] rounded-xl shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">{n.title}</h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> {n.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> Audience: {n.targetAudience.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{n.body}</p>
                    <div className="text-[11px] text-[var(--text-secondary)] pt-1 flex items-center gap-4">
                      <span>Sent: {n.sentAt ? new Date(n.sentAt).toLocaleString() : "Now"}</span>
                      {n.recipientCount && (
                        <span>Recipients: <strong>{formatMetric(n.recipientCount)}</strong></span>
                      )}
                      {n.openCount && (
                        <span>Opens: <strong className="text-emerald-600">{formatMetric(n.openCount)}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
