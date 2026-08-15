export type UserStatus = "active" | "inactive" | "banned";

export interface UserEngagementStats {
  postsViewed: number;
  likesGiven: number;
  commentsMade: number;
  sharesCount: number;
  savesCount: number;
  audioPlaysCount: number;
  wallpaperSetsCount: number;
  ringtoneSetsCount: number;
}

export interface UserActivityLog {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
}

export interface User {
  id: string;
  name: string;
  identifier: string; // phone or email
  avatar?: string;
  registeredAt: string;
  lastActiveAt: string;
  device: string;
  language: string;
  isPremium: boolean;
  status: UserStatus;
  favoriteDeities: string[];
  contentInterests: string[];
  appVersion: string;
  referralSource: string;
  engagementStats: UserEngagementStats;
  recentActivity: UserActivityLog[];
}
