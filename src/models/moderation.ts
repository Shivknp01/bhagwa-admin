export type ReportReason = "spam" | "abuse" | "inappropriate" | "copyright" | "other";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";
export type CommentModerationStatus = "active" | "hidden" | "deleted";

export interface ReportedItem {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: string;
  contentId: string;
  contentTitle: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reportedAt: string;
}

export interface ModeratedComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  commentText: string;
  postId: string;
  postTitle: string;
  likesCount: number;
  reportsCount: number;
  status: CommentModerationStatus;
  createdAt: string;
}
