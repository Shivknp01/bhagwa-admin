export type PaymentStatus = "success" | "pending" | "refunded" | "failed";
export type PaymentPlatform = "Google Play" | "Apple" | "Web UPI";
export type SubscriptionPlan = "Monthly Premium" | "Yearly Devotee" | "VIP Pass";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  plan: SubscriptionPlan;
  amount: number;
  platform: PaymentPlatform;
  status: PaymentStatus;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmailOrPhone: string;
  plan: SubscriptionPlan;
  amount: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}
