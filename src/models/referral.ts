export interface ReferralFunnelStat {
  totalShares: number;
  referralClicks: number;
  installs: number;
  registrations: number;
  paidUsers: number;
  referralRevenue: number;
}

export interface TopReferrer {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  shares: number;
  clicks: number;
  registrations: number;
  paidUsers: number;
  revenue: number;
}
