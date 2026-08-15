import { ReportedItem, ModeratedComment } from "@/models/moderation";

export const initialMockReportedItems: ReportedItem[] = [
  {
    id: "rep_1",
    reporterId: "user_105",
    reporterName: "Amit Patel",
    contentType: "Comment",
    contentId: "c_801",
    contentTitle: "Unrelated promotion links in comment section",
    reason: "spam",
    description: "User posted external commercial promotion link on Mahadev Bhajan.",
    status: "pending",
    reportedAt: "2026-08-15T16:30:00Z",
  },
  {
    id: "rep_2",
    reporterId: "user_102",
    reporterName: "Pooja Verma",
    contentType: "Comment",
    contentId: "c_802",
    contentTitle: "Disrespectful comment on devotional post",
    reason: "abuse",
    description: "Inappropriate language used in discussion.",
    status: "pending",
    reportedAt: "2026-08-15T14:10:00Z",
  },
];

export const initialMockModeratedComments: ModeratedComment[] = [
  {
    id: "c_801",
    userId: "user_99",
    userName: "Spam Bot 404",
    commentText: "Check this fast online money link http://example.com/spam",
    postId: "post_3",
    postTitle: "Mera Bhola Hai Bhandari",
    likesCount: 0,
    reportsCount: 5,
    status: "hidden",
    createdAt: "2026-08-15T16:00:00Z",
  },
  {
    id: "c_802",
    userId: "user_98",
    userName: "Anonymous User",
    commentText: "Abusive and inappropriate commentary text here.",
    postId: "post_1",
    postTitle: "Good Morning Har Har Mahadev",
    likesCount: 1,
    reportsCount: 3,
    status: "active",
    createdAt: "2026-08-15T13:45:00Z",
  },
];
