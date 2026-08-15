"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Music,
  ImageIcon,
  Bell,
  Calendar,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Post, getDisplayedValue } from "@/models/post";
import { supabaseContentRepository } from "@/repositories/supabaseContentRepository";
import { StatCard } from "@/components/ui/StatCard";
import { ContentTypeBadge } from "@/components/ui/ContentTypeBadge";
import { cn } from "@/lib/utils";

function formatMetric(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function calculateEngagementRate(post: Post): number {
  const views = getDisplayedValue(post.engagement.actualViews, post.engagement.viewOverride, post.engagement.viewsOverrideEnabled);
  const likes = getDisplayedValue(post.engagement.actualLikes, post.engagement.likeOverride, post.engagement.likesOverrideEnabled);
  const comments = getDisplayedValue(post.engagement.actualComments, post.engagement.commentOverride, post.engagement.commentsOverrideEnabled);
  const shares = getDisplayedValue(post.engagement.actualShares, post.engagement.shareOverride, post.engagement.sharesOverrideEnabled);

  if (views === 0) return 0;
  return Number((((likes + comments + shares) / views) * 100).toFixed(1));
}

export default function EngagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePeriod, setDatePeriod] = useState("30D");
  const [rankSortBy, setRankSortBy] = useState<"views" | "likes" | "comments" | "shares" | "rate">("views");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const all = await supabaseContentRepository.getPosts("all");
      setPosts(all);
    } catch {
      alert("Error loading engagement analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Aggregate totals
  const totalViews = posts.reduce((acc, p) => acc + getDisplayedValue(p.engagement.actualViews, p.engagement.viewOverride, p.engagement.viewsOverrideEnabled), 0);
  const totalLikes = posts.reduce((acc, p) => acc + getDisplayedValue(p.engagement.actualLikes, p.engagement.likeOverride, p.engagement.likesOverrideEnabled), 0);
  const totalComments = posts.reduce((acc, p) => acc + getDisplayedValue(p.engagement.actualComments, p.engagement.commentOverride, p.engagement.commentsOverrideEnabled), 0);
  const totalShares = posts.reduce((acc, p) => acc + getDisplayedValue(p.engagement.actualShares, p.engagement.shareOverride, p.engagement.sharesOverrideEnabled), 0);
  const totalSaves = posts.reduce((acc, p) => acc + p.engagement.actualSaves, 0);
  const totalAudioPlays = posts.reduce((acc, p) => acc + p.engagement.actualAudioPlays, 0);
  const totalWallpaperSets = posts.reduce((acc, p) => acc + p.engagement.actualWallpaperSets, 0);
  const totalRingtoneSets = posts.reduce((acc, p) => acc + p.engagement.actualRingtoneSets, 0);

  // Ranked Content
  const sortedPosts = [...posts].sort((a, b) => {
    if (rankSortBy === "rate") return calculateEngagementRate(b) - calculateEngagementRate(a);
    if (rankSortBy === "likes") return b.engagement.actualLikes - a.engagement.actualLikes;
    if (rankSortBy === "comments") return b.engagement.actualComments - a.engagement.actualComments;
    if (rankSortBy === "shares") return b.engagement.actualShares - a.engagement.actualShares;
    return b.engagement.actualViews - a.engagement.actualViews;
  });

  // Chart Mock Time-Series
  const chartData = [
    { day: "Mon", views: Math.round(totalViews * 0.1), likes: Math.round(totalLikes * 0.1), comments: Math.round(totalComments * 0.1) },
    { day: "Tue", views: Math.round(totalViews * 0.14), likes: Math.round(totalLikes * 0.13), comments: Math.round(totalComments * 0.12) },
    { day: "Wed", views: Math.round(totalViews * 0.18), likes: Math.round(totalLikes * 0.16), comments: Math.round(totalComments * 0.15) },
    { day: "Thu", views: Math.round(totalViews * 0.15), likes: Math.round(totalLikes * 0.14), comments: Math.round(totalComments * 0.13) },
    { day: "Fri", views: Math.round(totalViews * 0.22), likes: Math.round(totalLikes * 0.21), comments: Math.round(totalComments * 0.22) },
    { day: "Sat", views: Math.round(totalViews * 0.28), likes: Math.round(totalLikes * 0.27), comments: Math.round(totalComments * 0.28) },
    { day: "Sun", views: Math.round(totalViews * 0.32), likes: Math.round(totalLikes * 0.3), comments: Math.round(totalComments * 0.31) },
  ];

  return (
    <div className="space-y-6 select-none pb-16 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Engagement Analytics & Overrides
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time tracking of views, likes, comments, shares, wallpaper sets, ringtone sets, and admin display overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] p-1 rounded-xl">
            {["7D", "30D", "90D", "1Y"].map((p) => (
              <button
                key={p}
                onClick={() => setDatePeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  datePeriod === p
                    ? "bg-[#FF7A00] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            title="Refresh Analytics"
            className="p-2 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-[#FF7A00]")} />
          </button>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard title="Views" value={totalViews} icon={Eye} />
        <StatCard title="Likes" value={totalLikes} icon={Heart} />
        <StatCard title="Comments" value={totalComments} icon={MessageSquare} />
        <StatCard title="Shares" value={totalShares} icon={Share2} />
        <StatCard title="Saves" value={totalSaves} icon={Bookmark} />
        <StatCard title="Plays" value={totalAudioPlays} icon={Music} />
        <StatCard title="Wallpapers" value={totalWallpaperSets} icon={ImageIcon} />
        <StatCard title="Ringtones" value={totalRingtoneSets} icon={Bell} />
      </div>

      {/* RECHARTS TREND VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views & Engagement Trend */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Daily Views & Reach Trend ({datePeriod})
            </h3>
            <span className="text-xs text-[#FF7A00] font-bold">Realtime</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#FF7A00" strokeWidth={2.5} fillOpacity={1} fill="url(#viewsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Likes & Comments Bar Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Likes & Comments Distribution
            </h3>
            <span className="text-xs text-emerald-500 font-bold">Daily Growth</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="likes" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP PERFORMING CONTENT TABLE */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">
              Top Performing Content
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Ranked list of highest performing posts by engagement metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Sort by:</span>
            <select
              value={rankSortBy}
              onChange={(e) => setRankSortBy(e.target.value as "views" | "likes" | "comments" | "shares" | "rate")}
              className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none"
            >
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
              <option value="comments">Most Comments</option>
              <option value="shares">Most Shares</option>
              <option value="rate">Highest Engagement Rate (%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-card)] border-b border-[var(--border-color)] text-xs uppercase text-[var(--text-secondary)] font-bold">
              <tr>
                <th className="p-3 w-12 text-center">Rank</th>
                <th className="p-3">Content</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-center">Views</th>
                <th className="p-3 text-center">Likes</th>
                <th className="p-3 text-center">Comments</th>
                <th className="p-3 text-center">Shares</th>
                <th className="p-3 text-center">Eng. Rate</th>
                <th className="p-3 text-right">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {sortedPosts.slice(0, 15).map((post, idx) => {
                const views = getDisplayedValue(post.engagement.actualViews, post.engagement.viewOverride, post.engagement.viewsOverrideEnabled);
                const likes = getDisplayedValue(post.engagement.actualLikes, post.engagement.likeOverride, post.engagement.likesOverrideEnabled);
                const comments = getDisplayedValue(post.engagement.actualComments, post.engagement.commentOverride, post.engagement.commentsOverrideEnabled);
                const shares = getDisplayedValue(post.engagement.actualShares, post.engagement.shareOverride, post.engagement.sharesOverrideEnabled);
                const rate = calculateEngagementRate(post);

                return (
                  <tr key={post.id} className="hover:bg-[var(--bg-card)]/50 transition-colors">
                    <td className="p-3 text-center font-extrabold text-[#FF7A00] text-xs">
                      #{idx + 1}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-[var(--border-color)] shrink-0 flex items-center justify-center">
                          {post.thumbnailUrl || post.mediaUrl ? (
                            <img src={post.thumbnailUrl || post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <span>🚩</span>
                          )}
                        </div>
                        <span className="font-bold text-xs text-[var(--text-primary)] truncate max-w-xs" title={post.title}>
                          {post.title}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <ContentTypeBadge type={post.contentType} />
                    </td>

                    <td className="p-3 text-center font-bold text-xs text-[var(--text-primary)]">
                      {formatMetric(views)}
                    </td>
                    <td className="p-3 text-center font-bold text-xs text-[var(--text-primary)]">
                      {formatMetric(likes)}
                    </td>
                    <td className="p-3 text-center font-bold text-xs text-[var(--text-primary)]">
                      {formatMetric(comments)}
                    </td>
                    <td className="p-3 text-center font-bold text-xs text-[var(--text-primary)]">
                      {formatMetric(shares)}
                    </td>

                    <td className="p-3 text-center font-extrabold text-xs text-emerald-600">
                      {rate}%
                    </td>

                    <td className="p-3 text-right">
                      <Link
                        href={`/engagement/content/${post.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:underline"
                      >
                        <span>Edit Overrides</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
