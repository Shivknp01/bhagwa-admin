export type NotificationStatus = "draft" | "scheduled" | "sent";

export interface NotificationMetrics {
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  openRate: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  deepLink?: string;
  audience: string;
  scheduledAt?: string;
  sentAt?: string;
  status: NotificationStatus;
  metrics?: NotificationMetrics;
  createdAt: string;
}
