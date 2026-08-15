"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Post } from "@/models/post";
import { supabaseContentRepository } from "@/repositories/supabaseContentRepository";
import { ContentTypeBadge } from "@/components/ui/ContentTypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";

export default function SingleContentAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Override States
  const [viewsOverrideEnabled, setViewsOverrideEnabled] = useState(false);
  const [viewOverride, setViewOverride] = useState<number>(0);

  const [likesOverrideEnabled, setLikesOverrideEnabled] = useState(false);
  const [likeOverride, setLikeOverride] = useState<number>(0);

  const [commentsOverrideEnabled, setCommentsOverrideEnabled] = useState(false);
  const [commentOverride, setCommentOverride] = useState<number>(0);

  const [sharesOverrideEnabled, setSharesOverrideEnabled] = useState(false);
  const [shareOverride, setShareOverride] = useState<number>(0);

  const [savesOverrideEnabled, setSavesOverrideEnabled] = useState(false);
  const [saveOverride, setSaveOverride] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const found = await supabaseContentRepository.getPostById(id);
        if (found) {
          setPost(found);
          const e = found.engagement;
          setViewsOverrideEnabled(e.viewsOverrideEnabled);
          setViewOverride(e.viewOverride ?? e.actualViews);

          setLikesOverrideEnabled(e.likesOverrideEnabled);
          setLikeOverride(e.likeOverride ?? e.actualLikes);

          setCommentsOverrideEnabled(e.commentsOverrideEnabled);
          setCommentOverride(e.commentOverride ?? e.actualComments);

          setSharesOverrideEnabled(e.sharesOverrideEnabled);
          setShareOverride(e.shareOverride ?? e.actualShares);

          setSavesOverrideEnabled(e.savesOverrideEnabled);
          setSaveOverride(e.saveOverride ?? e.actualSaves);
        }
      } catch {
        alert("Error loading post analytics");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  const handleSaveOverrides = async () => {
    if (!post) return;
    setSubmitting(true);
    try {
      await supabaseContentRepository.updateEngagementMetrics(post.id, {
        viewsOverrideEnabled,
        viewOverride: viewsOverrideEnabled ? viewOverride : undefined,
        likesOverrideEnabled,
        likeOverride: likesOverrideEnabled ? likeOverride : undefined,
        commentsOverrideEnabled,
        commentOverride: commentsOverrideEnabled ? commentOverride : undefined,
        sharesOverrideEnabled,
        shareOverride: sharesOverrideEnabled ? shareOverride : undefined,
        savesOverrideEnabled,
        saveOverride: savesOverrideEnabled ? saveOverride : undefined,
      });

      showToast("Display metric overrides updated in Supabase!");
      const updated = await supabaseContentRepository.getPostById(post.id);
      if (updated) setPost(updated);
    } catch {
      showToast("Error updating overrides");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetOverrides = async () => {
    if (!post) return;
    setSubmitting(true);
    try {
      const reset = await supabaseContentRepository.resetEngagementOverride(post.id);
      setPost(reset);
      setViewsOverrideEnabled(false);
      setViewOverride(reset.engagement.actualViews);
      setLikesOverrideEnabled(false);
      setLikeOverride(reset.engagement.actualLikes);
      setCommentsOverrideEnabled(false);
      setCommentOverride(reset.engagement.actualComments);
      setSharesOverrideEnabled(false);
      setShareOverride(reset.engagement.actualShares);
      setSavesOverrideEnabled(false);
      setSaveOverride(reset.engagement.actualSaves);
      showToast("Reset display overrides to actual user activity");
    } catch {
      showToast("Error resetting overrides");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
        <p className="text-sm font-medium">Loading content analytics from Supabase...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)] space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Content Not Found</h2>
        <Link href="/engagement" className="px-4 py-2 bg-[#FF7A00] text-white rounded-xl text-xs font-bold">
          Back to Engagement Analytics
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FF7A00] text-white px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-5 h-5 text-yellow-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/engagement"
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
              ID: {post.id} • Display Override Editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={submitting}
            onClick={handleResetOverrides}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--border-color)] text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Actuals</span>
          </button>
          <button
            disabled={submitting}
            onClick={handleSaveOverrides}
            className="inline-flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Overrides</span>
          </button>
        </div>
      </div>

      {/* ACTUAL VS DISPLAYED SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Actual Views" value={post.engagement.actualViews} icon={Eye} />
        <StatCard title="Actual Likes" value={post.engagement.actualLikes} icon={Heart} />
        <StatCard title="Actual Comments" value={post.engagement.actualComments} icon={MessageSquare} />
        <StatCard title="Actual Shares" value={post.engagement.actualShares} icon={Share2} />
      </div>

      {/* DISPLAY OVERRIDE FORM */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-5 shadow-xs">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Admin Display Metrics Override Editor
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure social proof numbers shown on Flutter mobile app without altering actual analytics.
          </p>
        </div>

        <div className="space-y-4">
          {/* Views Override */}
          <div className="p-4 border border-[var(--border-color)] rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-primary)] block">Views Metric</span>
              <span className="text-xs text-[var(--text-secondary)] block">
                Actual User Views: <strong>{post.engagement.actualViews.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={viewsOverrideEnabled}
                  onChange={(e) => setViewsOverrideEnabled(e.target.checked)}
                  className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
                />
                <span>Enable Override</span>
              </label>

              {viewsOverrideEnabled && (
                <input
                  type="number"
                  value={viewOverride}
                  onChange={(e) => setViewOverride(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 bg-[var(--bg-card)] border border-[#FF7A00] rounded-xl text-sm font-bold text-[var(--text-primary)] focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Likes Override */}
          <div className="p-4 border border-[var(--border-color)] rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-primary)] block">Likes Metric</span>
              <span className="text-xs text-[var(--text-secondary)] block">
                Actual User Likes: <strong>{post.engagement.actualLikes.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={likesOverrideEnabled}
                  onChange={(e) => setLikesOverrideEnabled(e.target.checked)}
                  className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
                />
                <span>Enable Override</span>
              </label>

              {likesOverrideEnabled && (
                <input
                  type="number"
                  value={likeOverride}
                  onChange={(e) => setLikeOverride(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 bg-[var(--bg-card)] border border-[#FF7A00] rounded-xl text-sm font-bold text-[var(--text-primary)] focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Comments Override */}
          <div className="p-4 border border-[var(--border-color)] rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-primary)] block">Comments Metric</span>
              <span className="text-xs text-[var(--text-secondary)] block">
                Actual User Comments: <strong>{post.engagement.actualComments.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={commentsOverrideEnabled}
                  onChange={(e) => setCommentsOverrideEnabled(e.target.checked)}
                  className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
                />
                <span>Enable Override</span>
              </label>

              {commentsOverrideEnabled && (
                <input
                  type="number"
                  value={commentOverride}
                  onChange={(e) => setCommentOverride(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 bg-[var(--bg-card)] border border-[#FF7A00] rounded-xl text-sm font-bold text-[var(--text-primary)] focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Shares Override */}
          <div className="p-4 border border-[var(--border-color)] rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-primary)] block">Shares Metric</span>
              <span className="text-xs text-[var(--text-secondary)] block">
                Actual User Shares: <strong>{post.engagement.actualShares.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={sharesOverrideEnabled}
                  onChange={(e) => setSharesOverrideEnabled(e.target.checked)}
                  className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
                />
                <span>Enable Override</span>
              </label>

              {sharesOverrideEnabled && (
                <input
                  type="number"
                  value={shareOverride}
                  onChange={(e) => setShareOverride(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 bg-[var(--bg-card)] border border-[#FF7A00] rounded-xl text-sm font-bold text-[var(--text-primary)] focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
