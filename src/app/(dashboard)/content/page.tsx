"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Copy,
  Trash2,
  Archive,
  CheckCircle,
  XCircle,
  Smartphone,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  ExternalLink,
} from "lucide-react";
import { Post, ContentType, PostStatus, getDisplayedValue } from "@/models/post";
import { supabaseContentRepository } from "@/repositories/supabaseContentRepository";
import { ContentFilterOptions } from "@/repositories/contentRepository";
import { ContentTypeBadge } from "@/components/ui/ContentTypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "all", label: "All" },
  { id: "wallpaper", label: "Wallpapers" },
  { id: "video", label: "Videos" },
  { id: "music", label: "Music" },
  { id: "bhajan", label: "Bhajans" },
  { id: "ringtone", label: "Ringtones" },
  { id: "mantra", label: "Mantras" },
  { id: "stuti", label: "Stutis" },
  { id: "status", label: "Status" },
  { id: "horoscope", label: "Horoscope" },
];

const deitiesList = ["All", "Mahadev", "Hanuman", "Krishna", "Shri Ram", "Ganesh", "Durga", "Lakshmi", "Saraswati"];
const categoriesList = ["All", "Devotional", "Wallpaper", "Bhajan", "Music", "Ringtone", "Mantra", "Stuti", "Horoscope", "Status"];
const languagesList = ["All", "Hindi", "English", "Sanskrit"];

function formatMetric(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function ContentPage() {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState("all");
  const [deity, setDeity] = useState("all");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState("all");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [premium, setPremium] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Preview Modal
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<Post | null>(null);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<{ action: string; label: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const filterOptions: ContentFilterOptions = {
        tab: activeTab,
        searchQuery,
        contentType: contentType !== "all" ? contentType : undefined,
        deity: deity !== "all" ? deity : undefined,
        category: category !== "all" ? category : undefined,
        language: language !== "all" ? language : undefined,
        status: status !== "all" ? status : undefined,
        featured: featured !== "all" ? featured : undefined,
        premium: premium !== "all" ? premium : undefined,
        dateRange: dateRange !== "all" ? dateRange : undefined,
        page,
        pageSize,
      };

      const result = await supabaseContentRepository.getFilteredPosts(filterOptions);
      setPosts(result.posts);
      setTotalCount(result.totalCount);
    } catch {
      showToast("Failed to fetch content from database");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, contentType, deity, category, language, status, featured, premium, dateRange, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setContentType(tabId);
    setPage(1);
    setSelectedIds([]);
  };

  // Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(posts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Single Row Actions
  const handlePublishToggle = async (post: Post) => {
    const newStatus: PostStatus = post.status === "published" ? "draft" : "published";
    try {
      await supabaseContentRepository.updatePost(post.id, { status: newStatus });
      showToast(`Content "${post.title}" ${newStatus === "published" ? "published" : "unpublished"}`);
      fetchPosts();
    } catch {
      showToast("Error updating status");
    }
  };

  const handleDuplicate = async (post: Post) => {
    try {
      const dup = await supabaseContentRepository.duplicatePost(post.id);
      showToast(`Duplicated as draft "${dup.title}"`);
      fetchPosts();
    } catch {
      showToast("Error duplicating content");
    }
  };

  const handleArchive = async (post: Post) => {
    try {
      await supabaseContentRepository.updatePost(post.id, { status: "archived" });
      showToast(`Archived "${post.title}"`);
      fetchPosts();
    } catch {
      showToast("Error archiving post");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmPost) return;
    try {
      await supabaseContentRepository.deletePost(deleteConfirmPost.id);
      showToast(`Deleted content "${deleteConfirmPost.title}"`);
      setDeleteConfirmPost(null);
      fetchPosts();
    } catch {
      showToast("Error deleting post");
    }
  };

  // Bulk Actions
  const handleBulkActionExecute = async () => {
    if (!bulkActionConfirm || selectedIds.length === 0) return;
    const { action } = bulkActionConfirm;

    try {
      if (action === "publish") {
        await supabaseContentRepository.bulkUpdateStatus(selectedIds, "published");
        showToast(`Published ${selectedIds.length} items`);
      } else if (action === "unpublish") {
        await supabaseContentRepository.bulkUpdateStatus(selectedIds, "draft");
        showToast(`Unpublished ${selectedIds.length} items`);
      } else if (action === "feature") {
        await supabaseContentRepository.bulkToggleFeatured(selectedIds, true);
        showToast(`Featured ${selectedIds.length} items`);
      } else if (action === "unfeature") {
        await supabaseContentRepository.bulkToggleFeatured(selectedIds, false);
        showToast(`Unfeatured ${selectedIds.length} items`);
      } else if (action === "archive") {
        await supabaseContentRepository.bulkUpdateStatus(selectedIds, "archived");
        showToast(`Archived ${selectedIds.length} items`);
      } else if (action === "delete") {
        await supabaseContentRepository.bulkDelete(selectedIds);
        showToast(`Deleted ${selectedIds.length} items`);
      }
      setSelectedIds([]);
      setBulkActionConfirm(null);
      fetchPosts();
    } catch {
      showToast("Bulk action execution failed");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FF7A00] text-white px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-5 h-5 text-yellow-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Content Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage wallpapers, bhajans, ringtones, mantras, stutis, horoscopes, videos, music, and status cards for Daivik.
          </p>
        </div>

        <Link
          href="/content/create"
          className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create Content</span>
        </Link>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-color)] scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                isActive
                  ? "bg-[#FF7A00] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FILTER BAR */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by title, tags, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          {/* Deity */}
          <div>
            <select
              value={deity}
              onChange={(e) => setDeity(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">Deity: All</option>
              {deitiesList.filter((d) => d !== "All").map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">Category: All</option>
              {categoriesList.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">Status: All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Featured */}
          <div>
            <select
              value={featured}
              onChange={(e) => setFeatured(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">Featured: All</option>
              <option value="featured">Featured Only</option>
              <option value="not_featured">Not Featured</option>
            </select>
          </div>

          {/* Premium */}
          <div>
            <select
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">Access: All</option>
              <option value="free">Free</option>
              <option value="premium">Premium Only</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="all">Date: All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
            <button
              onClick={() => {
                setPage(1);
                fetchPosts();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#FF7A00] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#E66E00] transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply
            </button>
            <button
              onClick={() => {
                setSearchQuery("");
                setContentType("all");
                setDeity("all");
                setCategory("all");
                setLanguage("all");
                setStatus("all");
                setFeatured("all");
                setPremium("all");
                setDateRange("all");
                setActiveTab("all");
                setPage(1);
              }}
              className="px-3 py-2 border border-[var(--border-color)] rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-[#FF7A00]/10 border border-[#FF7A00]/30 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="bg-[#FF7A00] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-[var(--text-secondary)]">Choose bulk operation:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setBulkActionConfirm({ action: "publish", label: "Publish Selected" })}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Publish
            </button>
            <button
              onClick={() => setBulkActionConfirm({ action: "unpublish", label: "Unpublish Selected" })}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Unpublish
            </button>
            <button
              onClick={() => setBulkActionConfirm({ action: "feature", label: "Feature Selected" })}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Feature
            </button>
            <button
              onClick={() => setBulkActionConfirm({ action: "unfeature", label: "Unfeature Selected" })}
              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Unfeature
            </button>
            <button
              onClick={() => setBulkActionConfirm({ action: "archive", label: "Archive Selected" })}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Archive
            </button>
            <button
              onClick={() => setBulkActionConfirm({ action: "delete", label: "Delete Selected" })}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* CONTENT TABLE */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
            <p className="text-sm font-medium">Fetching real backend content from Supabase...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
            <p className="text-base font-bold text-[var(--text-primary)]">No content found</p>
            <p className="text-xs">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-card)] border-b border-[var(--border-color)] text-xs uppercase text-[var(--text-secondary)] font-bold">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={posts.length > 0 && selectedIds.length === posts.length}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
                    />
                  </th>
                  <th className="p-4">Thumbnail</th>
                  <th className="p-4">Content</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Deity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Views</th>
                  <th className="p-4 text-center">Likes</th>
                  <th className="p-4 text-center">Shares</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {posts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);
                  const views = getDisplayedValue(post.engagement.actualViews, post.engagement.viewOverride, post.engagement.viewsOverrideEnabled);
                  const likes = getDisplayedValue(post.engagement.actualLikes, post.engagement.likeOverride, post.engagement.likesOverrideEnabled);
                  const shares = getDisplayedValue(post.engagement.actualShares, post.engagement.shareOverride, post.engagement.sharesOverrideEnabled);

                  return (
                    <tr
                      key={post.id}
                      className={cn(
                        "hover:bg-[var(--bg-card)]/50 transition-colors",
                        isSelected && "bg-[#FF7A00]/5"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(post.id)}
                          className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
                        />
                      </td>

                      {/* Thumbnail */}
                      <td className="p-4 w-16">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-[var(--border-color)] flex items-center justify-center shrink-0">
                          {post.thumbnailUrl || post.mediaUrl ? (
                            <img
                              src={post.thumbnailUrl || post.mediaUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🕉️</span>
                          )}
                        </div>
                      </td>

                      {/* Content Title & Meta */}
                      <td className="p-4">
                        <div className="flex flex-col max-w-xs">
                          <span className="font-bold text-[var(--text-primary)] truncate" title={post.title}>
                            {post.title}
                          </span>
                          {post.description && (
                            <span className="text-xs text-[var(--text-secondary)] truncate mt-0.5" title={post.description}>
                              {post.description}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            {post.isFeatured && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">
                                ★ Featured
                              </span>
                            )}
                            {post.isPremium && (
                              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded">
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <ContentTypeBadge type={post.contentType} />
                      </td>

                      {/* Deity */}
                      <td className="p-4 whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">
                        {post.deity || "Mahadev"}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <StatusBadge status={post.status} />
                      </td>

                      {/* Metrics */}
                      <td className="p-4 text-center font-semibold text-xs text-[var(--text-primary)]">
                        {formatMetric(views)}
                      </td>
                      <td className="p-4 text-center font-semibold text-xs text-[var(--text-primary)]">
                        {formatMetric(likes)}
                      </td>
                      <td className="p-4 text-center font-semibold text-xs text-[var(--text-primary)]">
                        {formatMetric(shares)}
                      </td>

                      {/* Created Date */}
                      <td className="p-4 whitespace-nowrap text-xs text-[var(--text-secondary)]">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewPost(post)}
                            title="Mobile Preview"
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[#FF7A00] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/content/${post.id}`}
                            title="View Detail"
                            className="p-1.5 text-[var(--text-secondary)] hover:text-blue-500 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/content/${post.id}/edit`}
                            title="Edit"
                            className="p-1.5 text-[var(--text-secondary)] hover:text-amber-500 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(post)}
                            title="Duplicate"
                            className="p-1.5 text-[var(--text-secondary)] hover:text-purple-500 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePublishToggle(post)}
                            title={post.status === "published" ? "Unpublish" : "Publish"}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                          >
                            {post.status === "published" ? (
                              <XCircle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmPost(post)}
                            title="Delete"
                            className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Showing {posts.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(page * pageSize, totalCount)} of {totalCount} posts
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--bg-card)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--bg-card)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE PHONE PREVIEW MODAL */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setPreviewPost(null)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
                Android Flutter Preview
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {previewPost.title}
              </h3>
            </div>

            {/* Mock Smartphone Frame */}
            <div className="w-full bg-[#0F0906] text-white rounded-3xl border-4 border-slate-800 p-4 shadow-inner space-y-3">
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <img src="/daivik_logo.png" alt="Daivik" className="w-5 h-5 rounded-full" />
                  <span className="text-xs font-extrabold text-[#FF7A00]">Daivik — Bhakti</span>
                </div>
                <span className="text-[10px] bg-[#FF7A00]/20 text-[#FF7A00] px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>

              {/* Media Container */}
              <div className="w-full h-44 rounded-2xl bg-black overflow-hidden relative border border-white/10 flex items-center justify-center">
                {previewPost.thumbnailUrl || previewPost.mediaUrl ? (
                  <img
                    src={previewPost.thumbnailUrl || previewPost.mediaUrl}
                    alt={previewPost.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl">🚩</span>
                    <p className="text-xs text-amber-200 mt-2 font-bold">{previewPost.title}</p>
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-amber-300">
                  {previewPost.contentType.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-white/80 line-clamp-2">
                {previewPost.description || "Daily devotional feeds, wallpapers, bhajans, and mantras."}
              </p>

              {/* Action Button */}
              <div className="w-full py-2.5 bg-[#FF7A00] rounded-xl text-center text-white text-xs font-bold shadow-md">
                {previewPost.actionLabel || "Set Wallpaper 🚩"}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPreviewPost(null)}
                className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-red-500">Confirm Delete Content</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Are you sure you want to permanently delete <strong>&quot;{deleteConfirmPost.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmPost(null)}
                className="px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTION CONFIRMATION MODAL */}
      {bulkActionConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Confirm Bulk Action</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Are you sure you want to perform <strong>&quot;{bulkActionConfirm.label}&quot;</strong> on <strong>{selectedIds.length}</strong> selected posts?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBulkActionConfirm(null)}
                className="px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkActionExecute}
                className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold"
              >
                Execute Bulk Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
