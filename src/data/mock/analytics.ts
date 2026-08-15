export interface ChartDataPoint {
  date: string;
  newRegistrations?: number;
  activeUsers?: number;
  revenue?: number;
  subscriptions?: number;
  refunds?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  audioPlays?: number;
  wallpaperSets?: number;
  ringtoneSets?: number;
}

export const mockUserGrowthData: ChartDataPoint[] = [
  { date: "Aug 09", newRegistrations: 1820, activeUsers: 14200 },
  { date: "Aug 10", newRegistrations: 2100, activeUsers: 15400 },
  { date: "Aug 11", newRegistrations: 1950, activeUsers: 16100 },
  { date: "Aug 12", newRegistrations: 2300, activeUsers: 16800 },
  { date: "Aug 13", newRegistrations: 2250, activeUsers: 17200 },
  { date: "Aug 14", newRegistrations: 2380, activeUsers: 17900 },
  { date: "Aug 15", newRegistrations: 2431, activeUsers: 18240 },
];

export const mockRevenueData: ChartDataPoint[] = [
  { date: "Aug 09", revenue: 24500, subscriptions: 21000, refunds: 400 },
  { date: "Aug 10", revenue: 28900, subscriptions: 26000, refunds: 0 },
  { date: "Aug 11", revenue: 26400, subscriptions: 24500, refunds: 200 },
  { date: "Aug 12", revenue: 31200, subscriptions: 29000, refunds: 0 },
  { date: "Aug 13", revenue: 34500, subscriptions: 32000, refunds: 600 },
  { date: "Aug 14", revenue: 38200, subscriptions: 36000, refunds: 200 },
  { date: "Aug 15", revenue: 42100, subscriptions: 40000, refunds: 0 },
];

export const mockEngagementData: ChartDataPoint[] = [
  { date: "Aug 09", views: 380000, likes: 62000, comments: 8400, shares: 29000, saves: 42000, audioPlays: 61000, wallpaperSets: 5400, ringtoneSets: 2100 },
  { date: "Aug 10", views: 410000, likes: 68000, comments: 9100, shares: 32000, saves: 46000, audioPlays: 66000, wallpaperSets: 5900, ringtoneSets: 2400 },
  { date: "Aug 11", views: 395000, likes: 65000, comments: 8800, shares: 30500, saves: 44000, audioPlays: 63000, wallpaperSets: 5600, ringtoneSets: 2300 },
  { date: "Aug 12", views: 440000, likes: 73000, comments: 9800, shares: 35000, saves: 50000, audioPlays: 71000, wallpaperSets: 6300, ringtoneSets: 2700 },
  { date: "Aug 13", views: 460000, likes: 77000, comments: 10400, shares: 37000, saves: 53000, audioPlays: 75000, wallpaperSets: 6700, ringtoneSets: 2900 },
  { date: "Aug 14", views: 490000, likes: 82000, comments: 11100, shares: 39500, saves: 57000, audioPlays: 80000, wallpaperSets: 7100, ringtoneSets: 3100 },
  { date: "Aug 15", views: 520000, likes: 88000, comments: 11900, shares: 42000, saves: 61000, audioPlays: 85000, wallpaperSets: 7500, ringtoneSets: 3300 },
];
