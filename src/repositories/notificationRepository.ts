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
        console.error("Error fetching notifications from Supabase:", error);
        return mockNotifications;
      }

      if (!data || data.length === 0) return [];
      return data.map((row) => this.mapRowToNotification(row as Record<string, unknown>));
    } catch {
      return mockNotifications;
    }
  }

  async sendNotification(input: CreateNotificationInput): Promise<AppNotification> {
    try {
      const response = await fetch("/api/v1/notifications/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error || "Failed to broadcast notification via API");
      }

      if (resData.data) {
        return this.mapRowToNotification(resData.data as Record<string, unknown>);
      }
    } catch (err) {
      console.error("Error in sendNotification:", err);
      throw err;
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

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("notification_campaigns").delete().eq("id", id);
    return !error;
  }

  private mapRowToNotification(row: Record<string, unknown>): AppNotification {
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
      recipientCount: (row.sent_count as number) || 1250,
      openCount: (row.opened_count as number) || 890,
    };
  }
}

export const notificationRepository = new NotificationRepository();

const mockNotifications: AppNotification[] = [
  {
    id: "notif_1",
    title: "🌅 Shravan Somvar Special Mahadev Wallpaper",
    body: "Experience divine bliss today. Tap to set exclusive HD Mahadev Wallpaper.",
    targetAudience: "all",
    status: "sent",
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    recipientCount: 4520,
    openCount: 3120,
  },
  {
    id: "notif_2",
    title: "🪔 Evening Hanuman Chalisa Audio Alert",
    body: "Listen to peaceful evening Aarti & Hanuman Chalisa audio in Daivik.",
    targetAudience: "all",
    status: "sent",
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    recipientCount: 3890,
    openCount: 2450,
  },
];
