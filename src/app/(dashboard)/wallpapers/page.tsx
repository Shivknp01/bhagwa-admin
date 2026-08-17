"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle,
  X,
  ExternalLink,
  Flame,
  Search,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface DeityRow {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  symbol: string | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface WallpaperPostRow {
  id: string;
  title: string;
  title_hi?: string;
  description?: string;
  content_type: string;
  thumbnail_url: string | null;
  media_url: string | null;
  deity_id?: string;
  author_name?: string;
  is_featured?: boolean;
  status: string;
  created_at: string;
  view_override?: number;
  like_override?: number;
}

export default function WallpapersManagementPage() {
  const supabase = createClient();

  const [deities, setDeities] = useState<DeityRow[]>([]);
  const [wallpapers, setWallpapers] = useState<WallpaperPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [showAddWallpaperModal, setShowAddWallpaperModal] = useState(false);
  const [showAddDeityModal, setShowAddDeityModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Deity Form
  const [deityName, setDeityName] = useState("");
  const [deityTitle, setDeityTitle] = useState("");
  const [deitySymbol, setDeitySymbol] = useState("🚩");
  const [deityImageUrl, setDeityImageUrl] = useState("");

  // New Wallpaper Form
  const [wpTitle, setWpTitle] = useState("");
  const [wpTitleHi, setWpTitleHi] = useState("");
  const [wpImageUrl, setWpImageUrl] = useState("");
  const [wpSelectedDeityId, setWpSelectedDeityId] = useState("");
  const [wpCustomDeityName, setWpCustomDeityName] = useState("");
  const [wpIsLive, setWpIsLive] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Deities
      const { data: deitiesData } = await supabase
        .from("deities")
        .select("*")
        .order("created_at", { ascending: false });

      if (deitiesData) {
        setDeities(deitiesData);
        if (deitiesData.length > 0 && !wpSelectedDeityId) {
          setWpSelectedDeityId(deitiesData[0].id);
        }
      }

      // 2. Fetch Wallpaper Posts
      const { data: wpData } = await supabase
        .from("posts")
        .select("*")
        .eq("content_type", "wallpaper")
        .order("created_at", { ascending: false });

      if (wpData) {
        setWallpapers(wpData);
      }
    } catch (err) {
      console.error("Error fetching wallpapers:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, wpSelectedDeityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Add Deity
  const handleAddDeity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deityName.trim()) {
      showToast("Please enter God/Goddess Name", "error");
      return;
    }

    setSubmitting(true);
    try {
      const slug = deityName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { data, error } = await supabase
        .from("deities")
        .insert({
          name: deityName.trim(),
          slug,
          title: deityTitle.trim() || deityName.trim(),
          symbol: deitySymbol || "🚩",
          image_url: deityImageUrl.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      showToast(`✨ Added deity "${deityName}" successfully!`);
      setDeityName("");
      setDeityTitle("");
      setDeityImageUrl("");
      setShowAddDeityModal(false);
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add deity", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Wallpaper
  const handleAddWallpaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpTitle.trim()) {
      showToast("Please enter Wallpaper Title", "error");
      return;
    }
    if (!wpImageUrl.trim()) {
      showToast("Please enter Wallpaper Image URL", "error");
      return;
    }

    setSubmitting(true);
    try {
      let finalDeityId = wpSelectedDeityId;

      // If user provided a custom new deity name inside wallpaper modal
      if (wpCustomDeityName.trim()) {
        const slug = wpCustomDeityName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const { data: newDeity, error: deityErr } = await supabase
          .from("deities")
          .insert({
            name: wpCustomDeityName.trim(),
            slug,
            title: wpCustomDeityName.trim(),
            symbol: "🚩",
            image_url: wpImageUrl.trim(),
            is_active: true,
          })
          .select()
          .single();

        if (!deityErr && newDeity) {
          finalDeityId = newDeity.id;
        }
      }

      // Insert wallpaper into posts table
      const { error } = await supabase.from("posts").insert({
        content_type: "wallpaper",
        title: wpTitle.trim(),
        title_hi: wpTitleHi.trim() || wpTitle.trim(),
        description: `Sacred Ultra HD Wallpaper: ${wpTitle.trim()}`,
        thumbnail_url: wpImageUrl.trim(),
        media_url: wpImageUrl.trim(),
        deity_id: finalDeityId || null,
        action_type: "setWallpaper",
        action_label: "Set Wallpaper",
        action_label_hi: "वॉलपेपर लगाएं",
        author_name: "Daivik Wallpapers",
        is_featured: wpIsLive,
        status: "published",
        view_override: 1200,
        like_override: 340,
        views_override_enabled: true,
        likes_override_enabled: true,
      });

      if (error) throw error;

      showToast("🖼️ New Wallpaper published successfully to App!");
      setWpTitle("");
      setWpTitleHi("");
      setWpImageUrl("");
      setWpCustomDeityName("");
      setWpIsLive(false);
      setShowAddWallpaperModal(false);
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to publish wallpaper", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Wallpaper
  const handleDeleteWallpaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallpaper?")) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      showToast("Wallpaper deleted");
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  return (
    <div className="space-y-6 select-none pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 max-w-md",
            toastMessage.type === "success" ? "bg-[#FF7A00] text-white" : "bg-red-600 text-white"
          )}
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#FF7A00]/10 text-[#FF7A00] rounded-xl">
              <ImageIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
              Wallpaper & Deity Management
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 ml-10">
            Add sacred wallpapers & gods. Everything published here reflects live inside the mobile app!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddDeityModal(true)}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-black/5 dark:hover:bg-white/5 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            <span>+ Add New God/Goddess</span>
          </button>

          <button
            onClick={() => setShowAddWallpaperModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#FF7A00]/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Wallpaper</span>
          </button>

          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Section 1: Gods & Goddesses Circles */}
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF7A00]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Active Gods & Goddesses ({deities.length})
            </h2>
          </div>
          <button
            onClick={() => setShowAddDeityModal(true)}
            className="text-xs font-bold text-[#FF7A00] hover:underline"
          >
            + Add God
          </button>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {deities.map((d) => (
            <div
              key={d.id}
              className="flex flex-col items-center gap-1.5 shrink-0 p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] min-w-[90px] text-center"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#FF7A00]/40 bg-gray-900 flex items-center justify-center">
                {d.image_url ? (
                  <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{d.symbol || "🕉️"}</span>
                )}
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[80px]">
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Published Wallpapers Grid */}
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#FF7A00]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Published Wallpapers ({wallpapers.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A00]" />
            <span>Loading wallpapers...</span>
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
            No wallpapers added yet. Click <strong>+ Add Wallpaper</strong> to publish one!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wallpapers.map((wp) => (
              <div
                key={wp.id}
                className="group relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black aspect-[9/16] shadow-xs flex flex-col justify-between"
              >
                <img
                  src={wp.thumbnail_url || wp.media_url || "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400"}
                  alt={wp.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Top Badge */}
                <div className="relative p-2.5 flex items-center justify-between z-10">
                  {wp.is_featured ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-[9px] font-extrabold tracking-wider uppercase">
                      LIVE ✨
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => handleDeleteWallpaper(wp.id)}
                    title="Delete Wallpaper"
                    className="p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Details */}
                <div className="relative p-3 z-10 space-y-1">
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {wp.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Add New God/Goddess Modal */}
      {showAddDeityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF7A00]" />
                Add New God / Goddess
              </h3>
              <button
                onClick={() => setShowAddDeityModal(false)}
                className="p-1 text-[var(--text-secondary)] hover:bg-black/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  God / Goddess Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kuber Dev, Shri Ram, Maa Kali, Sai Baba"
                  value={deityName}
                  onChange={(e) => setDeityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Title / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lord of Wealth, Maryada Purushottam"
                  value={deityTitle}
                  onChange={(e) => setDeityTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Circle Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (Image for circular bubble in app)"
                  value={deityImageUrl}
                  onChange={(e) => setDeityImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeityModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold shadow-md shadow-[#FF7A00]/25"
                >
                  {submitting ? "Saving..." : "Save God/Goddess"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Wallpaper Modal */}
      {showAddWallpaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#FF7A00]" />
                Publish New Wallpaper
              </h3>
              <button
                onClick={() => setShowAddWallpaperModal(false)}
                className="p-1 text-[var(--text-secondary)] hover:bg-black/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWallpaper} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Wallpaper Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Kuber Dev Golden Treasury 🪙"
                  value={wpTitle}
                  onChange={(e) => setWpTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Wallpaper Title (Hindi)
                </label>
                <input
                  type="text"
                  placeholder="e.g. श्री कुबेर देव वॉलपेपर"
                  value={wpTitleHi}
                  onChange={(e) => setWpTitleHi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Select God / Goddess
                </label>
                <select
                  value={wpSelectedDeityId}
                  onChange={(e) => setWpSelectedDeityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                >
                  {deities.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.symbol ? `(${d.symbol})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Or Type a New God Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Type new deity name if not in dropdown"
                  value={wpCustomDeityName}
                  onChange={(e) => setWpCustomDeityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  High-Res Wallpaper Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-... (9:16 portrait URL)"
                  value={wpImageUrl}
                  onChange={(e) => setWpImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isLiveWp"
                  checked={wpIsLive}
                  onChange={(e) => setWpIsLive(e.target.checked)}
                  className="w-4 h-4 accent-[#FF7A00] rounded"
                />
                <label htmlFor="isLiveWp" className="text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                  Feature in "Top Live Wallpapers" section (LIVE ✨ badge)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddWallpaperModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold shadow-md shadow-[#FF7A00]/25"
                >
                  {submitting ? "Publishing..." : "Publish Wallpaper to App"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
