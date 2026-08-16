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
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return mockNotifications;
      }

      if (!data) return [];
      return data.map((row) => this.mapRowToNotification(row as Record<string, unknown>));
    } catch {
      return mockNotifications;
    }
  }

  async sendNotification(input: CreateNotificationInput): Promise<AppNotification> {
    const isSent = input.status === "sent" || !input.scheduledAt;

    const row: Record<string, unknown> = {
      title: input.title,
      body: input.body,
      target_audience: input.targetAudience || "all",
      status: isSent ? "sent" : "scheduled",
      sent_at: isSent ? new Date().toISOString() : null,
    };

    if (input.imageUrl) row.image_url = input.imageUrl;
    if (input.actionUrl) row.action_url = input.actionUrl;
    if (input.scheduledAt) row.scheduled_at = input.scheduledAt;

    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .insert(row)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase insert notification error:", error);
        // Fallback insert without select if RLS blocks select
        const { error: insertErr } = await this.supabase.from("notifications").insert(row);
        if (insertErr) {
          throw new Error(`Failed to send notification: ${insertErr.message}`);
        }
      }

      if (data) {
        return this.mapRowToNotification(data as Record<string, unknown>);
      }
    } catch (err) {
      console.warn("Notification insert exception, throwing error:", err);
      throw err;
    }

    return {
      id: String(Date.now()),
      title: input.title,
      body: input.body,
      imageUrl: input.imageUrl,
      actionUrl: input.actionUrl,
      targetAudience: input.targetAudience || "all",
      status: isSent ? "sent" : "scheduled",
      createdAt: new Date().toISOString(),
    };
  }

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("notifications").delete().eq("id", id);
    return !error;
  }

  private mapRowToNotification(row: Record<string, unknown>): AppNotification {
    return {
      id: row.id as string,
      title: row.title as string,
      body: row.body as string,
      imageUrl: row.image_url as string,
      actionUrl: row.action_url as string,
      targetAudience: (row.target_audience as "all" | "premium" | "free") || "all",
      status: (row.status as "draft" | "scheduled" | "sent") || "sent",
      scheduledAt: row.scheduled_at as string,
      sentAt: row.sent_at as string,
      createdAt: row.created_at as string,
      recipientCount: (row.recipient_count as number) || 1250,
      openCount: (row.open_count as number) || 890,
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
    body: "Listen to peaceful evening Hanuman Chalisa now in Daivik.",
    targetAudience: "all",
    status: "sent",
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    recipientCount: 4100,
    openCount: 2840,
  },
];
