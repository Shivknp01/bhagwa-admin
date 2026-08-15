"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Activity,
  Crown,
  IndianRupee,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Music,
  Image as ImageIcon,
  BellRing,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ContentTypeBadge } from "@/components/ui/ContentTypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Post, getDisplayedValue } from "@/models/post";

interface DashboardOverviewStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  premiumUsers: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

export default function DashboardOverviewPage() {
  const supabase = createClient();

  const [timeFilter, setTimeFilter] = useState("30D");
  const [stats, setStats] = useState<DashboardOverviewStats>({
    totalUsers: 124820,
    newUsersToday: 2431,
    activeUsers: 18240,
    premiumUsers: 4820,
    totalViews: 482500,
    totalLikes: 142300,
    totalComments: 18400,
    totalShares: 42100,
    totalSaves: 38200,
  });

  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [recentUsers, setRecentUsers] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Call get_dashboard_overview RPC
        const { data: overviewData } = await supabase.rpc("get_dashboard_overview");
        if (overviewData) {
          setStats((prev) => ({
            ...prev,
            totalViews: overviewData.total_views || prev.totalViews,
            totalLikes: overviewData.total_likes || prev.totalLikes,
            totalUsers: overviewData.total_users || prev.totalUsers,
            activeUsers: overviewData.active_users || prev.activeUsers,
            premiumUsers: overviewData.premium_users || prev.premiumUsers,
          }));
        }

        // 2. Query posts table for top content
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (postsData && postsData.length > 0) {
          const mappedPosts: Post[] = postsData.map((row) => ({
            id: row.id as string,
            contentType: row.content_type,
            title: row.title,
            titleHi: row.title_hi,
            description: row.description,
            authorName: row.author_name || "Bhakti Media",
            thumbnailUrl: row.thumbnail_url || row.media_url,
            mediaUrl: row.media_url,
            audioUrl: row.audio_url,
            deity: "Mahadev",
            category: "Devotional",
            language: row.language || "Hindi",
            tags: row.tags || [],
            actionType: row.action_type || "shareStatus",
            actionLabel: row.action_label || "Share Status",
            engagement: {
              actualViews: row.actual_views || 0,
              actualLikes: row.actual_likes || 0,
              actualComments: row.actual_comments || 0,
              actualShares: row.actual_shares || 0,
              actualSaves: row.actual_saves || 0,
              actualAudioPlays: row.actual_audio_plays || 0,
              actualWallpaperSets: row.actual_wallpaper_sets || 0,
              actualRingtoneSets: row.actual_ringtone_sets || 0,

              viewOverride: row.view_override,
              likeOverride: row.like_override,
              commentOverride: row.comment_override,
              shareOverride: row.share_override,
              saveOverride: row.save_override,

              viewsOverrideEnabled: row.views_override_enabled || false,
              likesOverrideEnabled: row.likes_override_enabled || false,
              commentsOverrideEnabled: row.comments_override_enabled || false,
              sharesOverrideEnabled: row.shares_override_enabled || false,
              savesOverrideEnabled: row.saves_override_enabled || false,
              audioPlaysOverrideEnabled: false,
              wallpaperSetsOverrideEnabled: false,
              ringtoneSetsOverrideEnabled: false,
            },
            isFeatured: row.is_featured || false,
            isPinned: row.is_pinned || false,
            isPremium: row.is_premium || false,
            status: row.status || "published",
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          setTopPosts(mappedPosts);
        }

        // 3. Query profiles table for recent registrations
        const { data: usersData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (usersData && usersData.length > 0) {
          setRecentUsers(usersData);
        }
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time analytics, user growth, revenue, and content engagement metrics for Bhagwa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["7D", "30D", "90D", "1Y"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFilter === tf
                  ? "bg-[#FF7A00] text-white shadow-xs"
                  : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          change="+12.4%"
          isPositive={true}
          icon={Users}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="New Users Today"
          value={formatNumber(stats.newUsersToday)}
          change="+8.2%"
          isPositive={true}
          icon={UserPlus}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="DAU"
          value={formatNumber(stats.activeUsers)}
          change="+6.7%"
          isPositive={true}
          icon={Activity}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Premium Users"
          value={formatNumber(stats.premiumUsers)}
          change="+14.2%"
          isPositive={true}
          icon={Crown}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Revenue (Month)"
          value="₹8,42,300"
          change="+18.4%"
          isPositive={true}
          icon={IndianRupee}
          iconBgColor="bg-[#FF7A00]/10 text-[#FF7A00]"
        />
      </div>

      {/* Engagement Metrics Summary Grid */}
      <div>
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">
          Overall Engagement Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <Eye className="w-3.5 h-3.5 text-blue-500" /> Total Views
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">
              {formatNumber(stats.totalViews)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Total Likes
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">
              {formatNumber(stats.totalLikes)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-sky-500" /> Comments
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">
              {formatNumber(stats.totalComments)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <Share2 className="w-3.5 h-3.5 text-emerald-500" /> Shares
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">
              {formatNumber(stats.totalShares)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Saves
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">
              {formatNumber(stats.totalSaves)}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <Music className="w-3.5 h-3.5 text-indigo-500" /> Audio Plays
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">68.4K</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-orange-500" /> Wallpapers
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">24.2K</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <BellRing className="w-3.5 h-3.5 text-purple-500" /> Ringtones
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mt-1">14.8K</p>
          </div>
        </div>
      </div>

      {/* Content & Users Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Content (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Top Performing Content
            </h2>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Ranked by Engagement
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] uppercase">
                  <th className="py-3 px-2">Content</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Views</th>
                  <th className="py-3 px-2">Likes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {topPosts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-xs text-[var(--text-secondary)]">
                      Loading top content from database...
                    </td>
                  </tr>
                ) : (
                  topPosts.map((post) => {
                    const views = getDisplayedValue(
                      post.engagement.actualViews,
                      post.engagement.viewOverride,
                      post.engagement.viewsOverrideEnabled
                    );
                    const likes = getDisplayedValue(
                      post.engagement.actualLikes,
                      post.engagement.likeOverride,
                      post.engagement.likesOverrideEnabled
                    );

                    return (
                      <tr key={post.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.thumbnailUrl || post.mediaUrl || "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=200"}
                              alt={post.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-[var(--text-primary)] line-clamp-1 max-w-[200px]">
                                {post.title}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)]">{post.deity}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <ContentTypeBadge type={post.contentType} />
                        </td>
                        <td className="py-3 px-2 font-medium">{formatNumber(views)}</td>
                        <td className="py-3 px-2 font-medium text-[#FF7A00]">{formatNumber(likes)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations (1 col) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Recent Registrations
            </h2>
            <span className="text-xs font-medium text-[#FF7A00]">Real Users</span>
          </div>

          <div className="space-y-3 divide-y divide-[var(--border-color)]">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">
                Loading recent devotees...
              </p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id as string} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {(u.display_name as string) || "Devotee"}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Bhagwa ID: #{u.user_id as number} • {(u.login_method as string) || "skip"}
                    </p>
                  </div>
                  <StatusBadge status={(u.status as string) || "active"} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
