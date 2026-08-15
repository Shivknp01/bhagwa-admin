import { ReferralFunnelStat, TopReferrer } from "@/models/referral";

export const initialMockReferralFunnel: ReferralFunnelStat = {
  totalShares: 82421,
  referralClicks: 31284,
  installs: 12482,
  registrations: 9842,
  paidUsers: 1284,
  referralRevenue: 1924716,
};

export const initialMockTopReferrers: TopReferrer[] = [
  {
    rank: 1,
    userId: "user_101",
    userName: "Aditya Sharma",
    userAvatar: "https://i.pravatar.cc/150?img=68",
    shares: 1420,
    clicks: 680,
    registrations: 310,
    paidUsers: 48,
    revenue: 71952,
  },
  {
    rank: 2,
    userId: "user_104",
    userName: "Neha Sharma",
    userAvatar: "https://i.pravatar.cc/150?img=25",
    shares: 980,
    clicks: 420,
    registrations: 215,
    paidUsers: 32,
    revenue: 47968,
  },
  {
    rank: 3,
    userId: "user_102",
    userName: "Pooja Verma",
    userAvatar: "https://i.pravatar.cc/150?img=47",
    shares: 740,
    clicks: 310,
    registrations: 145,
    paidUsers: 22,
    revenue: 32978,
  },
  {
    rank: 4,
    userId: "user_103",
    userName: "Ravi Kumar",
    userAvatar: "https://i.pravatar.cc/150?img=11",
    shares: 510,
    clicks: 220,
    registrations: 98,
    paidUsers: 14,
    revenue: 20986,
  },
];
