"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Music,
  Smartphone,
  Trash2,
  CheckCircle,
  XCircle,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Post, getDisplayedValue } from "@/models/post";
import { supabaseContentRepository } from "@/repositories/supabaseContentRepository";
import { ContentTypeBadge } from "@/components/ui/ContentTypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const found = await supabaseContentRepository.getPostById(id);
        setPost(found || null);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
        <p className="text-sm font-medium">Loading content details from Supabase...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)] space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Content Not Found</h2>
        <p className="text-sm">No post found with ID &quot;{id}&quot;.</p>
        <Link
          href="/content"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7A00] text-white font-bold rounded-xl text-xs"
        >
          Back to Content List
        </Link>
      </div>
    );
  }

  const views = getDisplayedValue(post.engagement.actualViews, post.engagement.viewOverride, post.engagement.viewsOverrideEnabled);
  const likes = getDisplayedValue(post.engagement.actualLikes, post.engagement.likeOverride, post.engagement.likesOverrideEnabled);
  const comments = getDisplayedValue(post.engagement.actualComments, post.engagement.commentOverride, post.engagement.commentsOverrideEnabled);
  const shares = getDisplayedValue(post.engagement.actualShares, post.engagement.shareOverride, post.engagement.sharesOverrideEnabled);

  return (
    <div className="space-y-6 select-none pb-16 max-w-5xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/content"
            className="p-2 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {post.title}
              </h1>
              <ContentTypeBadge type={post.contentType} />
              <StatusBadge status={post.status} />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              ID: {post.id} • Created {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/content/${post.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF7A00] text-white text-xs font-bold rounded-xl hover:bg-[#E66E00] shadow-sm transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Content</span>
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Views" value={views} icon={Eye} />
        <StatCard title="Likes" value={likes} icon={Heart} />
        <StatCard title="Comments" value={comments} icon={MessageSquare} />
        <StatCard title="Shares" value={shares} icon={Share2} />
      </div>

      {/* CONTENT MEDIA & METADATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Media Preview Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Media Preview
          </h3>

          <div className="w-full h-64 rounded-xl bg-slate-900 overflow-hidden relative border border-[var(--border-color)] flex items-center justify-center">
            {post.contentType === "video" && post.mediaUrl ? (
              <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
            ) : post.thumbnailUrl || post.mediaUrl ? (
              <img src={post.thumbnailUrl || post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-4xl">🚩</span>
                <p className="text-xs text-white/80 mt-2">{post.title}</p>
              </div>
            )}
          </div>

          {post.audioUrl && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF7A00]">
                <Music className="w-4 h-4" />
                <span>Audio Track</span>
              </div>
              <audio src={post.audioUrl} controls className="w-full h-8" />
            </div>
          )}
        </div>

        {/* Right: Detailed Metadata & Information */}
        <div className="md:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Content Information
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[var(--text-secondary)] block font-semibold">Title (English)</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{post.title}</span>
            </div>
            <div>
              <span className="text-[var(--text-secondary)] block font-semibold">Title (Hindi)</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{post.titleHi || "—"}</span>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block font-semibold">Deity</span>
              <span className="font-bold text-[var(--text-primary)]">{post.deity || "Mahadev"}</span>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block font-semibold">Category</span>
              <span className="font-bold text-[var(--text-primary)]">{post.category || "Devotional"}</span>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block font-semibold">Language</span>
              <span className="font-bold text-[var(--text-primary)]">{post.language || "Hindi"}</span>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block font-semibold">CTA Button Action</span>
              <span className="font-bold text-[#FF7A00]">{post.actionLabel || "Set Wallpaper"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-[var(--text-secondary)] block">Description</span>
            <p className="text-sm text-[var(--text-primary)] bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]">
              {post.description || "No description provided."}
            </p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="text-xs bg-[#FF7A00]/10 text-[#FF7A00] font-semibold px-2.5 py-1 rounded-lg">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
