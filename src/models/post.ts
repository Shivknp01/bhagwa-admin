export type ContentType =
  | "wallpaper"
  | "video"
  | "music"
  | "bhajan"
  | "ringtone"
  | "mantra"
  | "stuti"
  | "status"
  | "horoscope";

export type PostStatus = "draft" | "published" | "scheduled" | "archived";

export interface EngagementMetrics {
  actualViews: number;
  actualLikes: number;
  actualComments: number;
  actualShares: number;
  actualSaves: number;
  actualAudioPlays: number;
  actualWallpaperSets: number;
  actualRingtoneSets: number;

  viewOverride?: number;
  likeOverride?: number;
  commentOverride?: number;
  shareOverride?: number;
  saveOverride?: number;
  audioPlayOverride?: number;
  wallpaperSetOverride?: number;
  ringtoneSetOverride?: number;

  viewsOverrideEnabled: boolean;
  likesOverrideEnabled: boolean;
  commentsOverrideEnabled: boolean;
  sharesOverrideEnabled: boolean;
  savesOverrideEnabled: boolean;
  audioPlaysOverrideEnabled: boolean;
  wallpaperSetsOverrideEnabled: boolean;
  ringtoneSetsOverrideEnabled: boolean;
}

export function getDisplayedValue(actual: number, override?: number, enabled?: boolean): number {
  if (enabled && override !== undefined) {
    return override;
  }
  return actual;
}

export interface Post {
  id: string;
  contentType: ContentType;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  audioUrl?: string;
  durationText?: string;
  authorName?: string;
  deity?: string;
  category?: string;
  language?: string;
  tags?: string[];
  actionType: string;
  actionLabel: string;
  actionLabelHi?: string;
  engagement: EngagementMetrics;
  isFeatured: boolean;
  isPinned?: boolean;
  isPremium: boolean;
  feedPriority?: number;
  status: PostStatus;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  contentType: ContentType;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  audioUrl?: string;
  durationText?: string;
  authorName?: string;
  deity?: string;
  category?: string;
  language?: string;
  tags?: string[];
  actionType: string;
  actionLabel: string;
  actionLabelHi?: string;
  isFeatured: boolean;
  isPinned?: boolean;
  isPremium: boolean;
  feedPriority?: number;
  status: PostStatus;
  scheduledAt?: string;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  engagement?: Partial<EngagementMetrics>;
}
