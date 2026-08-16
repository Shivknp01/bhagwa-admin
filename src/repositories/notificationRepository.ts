import { createClient } from "@/lib/supabase/client";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  targetAudience: "all" | "premium" | "free";
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  recipientCount?: number;
  openCount?: number;
}

export interface CreateNotificationInput {
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  targetAudience?: "all" | "premium" | "free";
  status?: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
}

export class NotificationRepository {
  private supabase = createClient();

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const { data, error } = await this.supabase
        .from("notification_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      if (!data || data.length === 0) return [];
      return data.map((row) => this.mapRowToNotification(row as Record<string, unknown>));
    } catch (err) {
      console.error("getNotifications error:", err);
      return [];
    }
  }

  async sendNotification(input: CreateNotificationInput): Promise<AppNotification> {
    const response = await fetch("/api/v1/notifications/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const resData = await response.json();

    if (!response.ok || resData.error) {
      throw new Error(resData.error || "Failed to broadcast notification via API");
    }

    if (resData.data) {
      return this.mapRowToNotification(resData.data as Record<string, unknown>);
    }

    return {
      id: String(Date.now()),
      title: input.title,
      body: input.body,
      imageUrl: input.imageUrl,
      actionUrl: input.actionUrl,
      targetAudience: input.targetAudience || "all",
      status: input.status || "sent",
      createdAt: new Date().toISOString(),
    };
  }

  /** Re-broadcast an existing notification campaign */
  async pushAgain(notification: AppNotification): Promise<{ sent: number; failed: number; tokens: number }> {
    const response = await fetch("/api/v1/notifications/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
        actionUrl: notification.actionUrl,
        targetAudience: notification.targetAudience,
        status: "sent",
      }),
    });

    const resData = await response.json();

    if (!response.ok || resData.error) {
      throw new Error(resData.error || "Failed to re-broadcast notification");
    }

    return resData.fcm || { sent: 0, failed: 0, tokens: 0 };
  }

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const response = await fetch("/api/v1/notifications/broadcast", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const resData = await response.json();
      if (!response.ok || resData.error) {
        throw new Error(resData.error || "Delete failed");
      }
      return true;
    } catch (err) {
      console.error("deleteNotification error:", err);
      throw err;
    }
  }

  mapRowToNotification(row: Record<string, unknown>): AppNotification {
    return {
      id: (row.id as string) || String(Date.now()),
      title: (row.title as string) || "Daivik Alert",
      body: (row.message as string) || (row.body as string) || "",
      imageUrl: (row.image_url as string) || undefined,
      actionUrl: (row.deep_link as string) || (row.action_url as string) || undefined,
      targetAudience: (row.audience as string) === "Premium Devotees" ? "premium" : "all",
      status: (row.status as "draft" | "scheduled" | "sent") || "sent",
      scheduledAt: (row.scheduled_at as string) || undefined,
      sentAt: (row.sent_at as string) || undefined,
      createdAt: (row.created_at as string) || new Date().toISOString(),
      recipientCount: (row.sent_count as number) || 0,
      openCount: (row.opened_count as number) || 0,
    };
  }
}

export const notificationRepository = new NotificationRepository();
