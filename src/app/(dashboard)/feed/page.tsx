"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Smartphone,
  Pin,
  Star,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  CheckCircle,
  X,
  Trash2,
  Calendar,
} from "lucide-react";
import { Post, getDisplayedValue } from "@/models/post";
import { supabaseContentRepository } from "@/repositories/supabaseContentRepository";
import { ContentTypeBadge } from "@/components/ui/ContentTypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

function formatMetric(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const all = await supabaseContentRepository.getPosts("all");
      // Sort by pinned desc, feedPriority desc
      const sorted = [...all].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.feedPriority || 0) - (a.feedPriority || 0);
      });
      setPosts(sorted);
    } catch {
      showToast("Error loading feed from Supabase");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Reorder Handler: Move Item Up/Down
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === posts.length - 1) return;

    const newPosts = [...posts];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newPosts[index];
    newPosts[index] = newPosts[targetIndex];
    newPosts[targetIndex] = temp;

    setPosts(newPosts);

    // Persist new ordering to Supabase
    try {
      const ids = newPosts.map((p) => p.id);
      await supabaseContentRepository.reorderFeed(ids);
      showToast("Feed layout order updated in database!");
    } catch {
      showToast("Error saving feed order");
    }
  };

  // Toggle Pin
  const handleTogglePin = async (post: Post) => {
    try {
      const newPinned = !post.isPinned;
      await supabaseContentRepository.updatePost(post.id, { isPinned: newPinned });
      showToast(newPinned ? `Pinned "${post.title}" to top` : `Unpinned "${post.title}"`);
      fetchFeed();
    } catch {
      showToast("Error updating pin state");
    }
  };

  // Toggle Feature
  const handleToggleFeature = async (post: Post) => {
    try {
      const newFeatured = !post.isFeatured;
      await supabaseContentRepository.updatePost(post.id, { isFeatured: newFeatured });
      showToast(newFeatured ? `Featured "${post.title}"` : `Unfeatured "${post.title}"`);
      fetchFeed();
    } catch {
      showToast("Error updating feature state");
    }
  };

  // Toggle Visibility / Hide
  const handleToggleVisibility = async (post: Post) => {
    try {
      const newStatus = post.status === "published" ? "archived" : "published";
      await supabaseContentRepository.updatePost(post.id, { status: newStatus });
      showToast(newStatus === "published" ? `Made "${post.title}" visible` : `Hidden "${post.title}" from feed`);
      fetchFeed();
    } catch {
      showToast("Error updating visibility");
    }
  };

  return (
    <div className="space-y-6 select-none pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FF7A00] text-white px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-5 h-5 text-yellow-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Feed Management & Mobile Order
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Control the exact sequence, pinned posts, featured items, and live visibility in the Daivik mobile home feed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-[#FF7A00]" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-bold focus:outline-none"
            >
              <option value="today">Today Feed</option>
              <option value="tomorrow">Tomorrow Schedule</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Feeds</option>
            </select>
          </div>

          <button
            onClick={fetchFeed}
            title="Refresh Feed"
            className="p-2 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-[#FF7A00]")} />
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Preview Mobile Feed</span>
          </button>
        </div>
      </div>

      {/* FEED LIST TABLE */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
            <p className="text-sm font-medium">Fetching active mobile feed from Supabase...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <p className="text-base font-bold text-[var(--text-primary)]">No content in feed</p>
            <p className="text-xs">Create or publish content to populate the mobile feed.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {posts.map((post, index) => {
              const views = getDisplayedValue(post.engagement.actualViews, post.engagement.viewOverride, post.engagement.viewsOverrideEnabled);
              const likes = getDisplayedValue(post.engagement.actualLikes, post.engagement.likeOverride, post.engagement.likesOverrideEnabled);

              return (
                <div
                  key={post.id}
                  className={cn(
                    "p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-card)]/50 transition-colors",
                    post.isPinned && "bg-amber-500/5"
                  )}
                >
                  {/* Left: Position & Reorder Handles */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-extrabold text-sm text-[#FF7A00]">
                      #{index + 1}
                    </span>

                    <div className="flex flex-col gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                        className="p-1 text-[var(--text-secondary)] hover:text-[#FF7A00] disabled:opacity-30 rounded hover:bg-[var(--bg-card)]"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === posts.length - 1}
                        onClick={() => handleMove(index, "down")}
                        className="p-1 text-[var(--text-secondary)] hover:text-[#FF7A00] disabled:opacity-30 rounded hover:bg-[var(--bg-card)]"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-[var(--border-color)] shrink-0 flex items-center justify-center">
                      {post.thumbnailUrl || post.mediaUrl ? (
                        <img src={post.thumbnailUrl || post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🕉️</span>
                      )}
                    </div>

                    {/* Content Title & Badges */}
                    <div className="flex flex-col max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)] truncate" title={post.title}>
                          {post.title}
                        </span>
                        {post.isPinned && (
                          <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                        {post.isFeatured && (
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <ContentTypeBadge type={post.contentType} />
                        <StatusBadge status={post.status} />
                        <span className="text-xs text-[var(--text-secondary)]">• {post.deity || "Mahadev"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Engagement Summary */}
                  <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
                    <span>👁 {formatMetric(views)}</span>
                    <span>❤️ {formatMetric(likes)}</span>
                  </div>

                  {/* Right: Quick Controls (Pin, Feature, Hide/Show) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePin(post)}
                      title={post.isPinned ? "Unpin Post" : "Pin to Top"}
                      className={cn(
                        "p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1",
                        post.isPinned
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                      )}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{post.isPinned ? "Pinned" : "Pin"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleFeature(post)}
                      title={post.isFeatured ? "Unfeature Post" : "Mark Featured"}
                      className={cn(
                        "p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1",
                        post.isFeatured
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                      )}
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{post.isFeatured ? "Featured" : "Feature"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleVisibility(post)}
                      title={post.status === "published" ? "Hide from Feed" : "Make Visible"}
                      className={cn(
                        "p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1",
                        post.status === "published"
                          ? "border-[var(--border-color)] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300"
                      )}
                    >
                      {post.status === "published" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="hidden lg:inline">{post.status === "published" ? "Visible" : "Hidden"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MOBILE FEED PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
                Live Mobile Feed Preview
              </span>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Exact feed order configured in Admin Dashboard
              </p>
            </div>

            {/* Android Device Mockup */}
            <div className="w-full h-96 bg-[#0F0906] text-white rounded-3xl border-4 border-slate-800 p-3 shadow-inner overflow-y-auto space-y-3 scrollbar-none">
              {/* App Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 sticky top-0 bg-[#0F0906] z-10">
                <div className="flex items-center gap-1.5">
                  <img src="/daivik_logo.png" alt="Daivik" className="w-5 h-5 rounded-full" />
                  <span className="text-xs font-extrabold text-[#FF7A00]">Daivik — Bhakti</span>
                </div>
                <span className="text-[10px] bg-[#FF7A00] text-white px-2 py-0.5 rounded-full font-bold">
                  {posts.length} Posts
                </span>
              </div>

              {/* Feed Items */}
              {posts.map((p, idx) => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-white/70">
                    <span className="font-bold text-[#FF7A00]">#{idx + 1} {p.contentType.toUpperCase()}</span>
                    <span>{p.deity || "Mahadev"}</span>
                  </div>

                  <div className="w-full h-28 rounded-xl bg-black overflow-hidden relative border border-white/10 flex items-center justify-center">
                    {p.thumbnailUrl || p.mediaUrl ? (
                      <img src={p.thumbnailUrl || p.mediaUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🚩</span>
                    )}
                  </div>

                  <span className="text-xs font-bold block text-white truncate">{p.title}</span>

                  <div className="w-full py-1.5 bg-[#FF7A00] rounded-lg text-center text-white text-[10px] font-bold">
                    {p.actionLabel || "Explore 🚩"}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)]"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
