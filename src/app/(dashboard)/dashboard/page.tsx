"use client";

import React, { useState } from "react";
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
import { initialMockPosts } from "@/data/mock/posts";
import { initialMockUsers } from "@/data/mock/users";
import { formatNumber } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const [timeFilter, setTimeFilter] = useState("30D");

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
          value="124,820"
          change="+12.4%"
          isPositive={true}
          icon={Users}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="New Users Today"
          value="2,431"
          change="+8.2%"
          isPositive={true}
          icon={UserPlus}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="DAU"
          value="18,240"
          change="+6.7%"
          isPositive={true}
          icon={Activity}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Premium Users"
          value="4,820"
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

      {/* Engagement Overview Grid (8 Cards) */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Engagement Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard title="Views" value="2.84M" icon={Eye} />
          <StatCard title="Likes" value="482K" icon={Heart} iconBgColor="bg-rose-500/10 text-rose-500" />
          <StatCard title="Comments" value="62K" icon={MessageSquare} iconBgColor="bg-sky-500/10 text-sky-500" />
          <StatCard title="Shares" value="218K" icon={Share2} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatCard title="Saves" value="321K" icon={Bookmark} iconBgColor="bg-amber-500/10 text-amber-500" />
          <StatCard title="Audio Plays" value="482K" icon={Music} iconBgColor="bg-purple-500/10 text-purple-500" />
          <StatCard title="Wallpaper Sets" value="42K" icon={ImageIcon} iconBgColor="bg-indigo-500/10 text-indigo-500" />
          <StatCard title="Ringtone Sets" value="18K" icon={BellRing} iconBgColor="bg-[#FF7A00]/10 text-[#FF7A00]" />
        </div>
      </div>

      {/* Two Column Layout: Top Content & Recent Registrations Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Content Preview */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Top Performing Content
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Ranked by Engagement</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {initialMockPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={post.thumbnailUrl || "https://placehold.co/100"}
                    alt={post.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-color)]"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <ContentTypeBadge type={post.contentType} />
                      <span className="text-xs text-[var(--text-secondary)]">• {post.deity}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-[var(--text-primary)]">
                    {formatNumber(post.engagement.actualViews)} views
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    {formatNumber(post.engagement.actualLikes)} likes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations Preview */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Recent Registrations
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Live Devotee Stream</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {initialMockUsers.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar || "https://i.pravatar.cc/150"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {user.identifier} • {user.language}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <StatusBadge status={user.status} />
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {user.isPremium ? "⭐ Premium" : "Free"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
