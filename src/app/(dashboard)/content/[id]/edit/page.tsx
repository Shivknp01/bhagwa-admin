"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Smartphone,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import { Post, ContentType, PostStatus } from "@/models/post";
import { supabaseContentRepository } from "@/repositories/supabaseContentRepository";
import { supabaseUploadService } from "@/services/supabaseUploadService";

const deities = ["Mahadev", "Hanuman", "Krishna", "Shri Ram", "Ganesh", "Durga", "Lakshmi", "Saraswati"];
const categories = ["Devotional", "Wallpaper", "Bhajan", "Music", "Ringtone", "Mantra", "Stuti", "Horoscope", "Status"];
const languages = ["Hindi", "English", "Sanskrit"];

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [deity, setDeity] = useState("Mahadev");
  const [category, setCategory] = useState("Devotional");
  const [language, setLanguage] = useState("Hindi");
  const [tagsInput, setTagsInput] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<PostStatus>("published");
  const [scheduledAt, setScheduledAt] = useState("");

  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const post = await supabaseContentRepository.getPostById(id);
        if (post) {
          setTitle(post.title);
          setTitleHi(post.titleHi || "");
          setDescription(post.description || "");
          setDescriptionHi(post.descriptionHi || "");
          setDeity(post.deity || "Mahadev");
          setCategory(post.category || "Devotional");
          setLanguage(post.language || "Hindi");
          setTagsInput(post.tags?.join(", ") || "");
          setActionLabel(post.actionLabel || "");
          setIsFeatured(post.isFeatured);
          setIsPremium(post.isPremium);
          setStatus(post.status);
          setScheduledAt(post.scheduledAt || "");
          setMediaUrl(post.mediaUrl || "");
          setThumbnailUrl(post.thumbnailUrl || "");
          setAudioUrl(post.audioUrl || "");
        }
      } catch {
        alert("Error loading post");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "media" | "thumbnail" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(15);
    try {
      const result = await supabaseUploadService.uploadFile(file, (p) => setUploadProgress(p));
      if (target === "media") setMediaUrl(result.url);
      if (target === "thumbnail") setThumbnailUrl(result.url);
      if (target === "audio") setAudioUrl(result.url);
    } catch {
      alert("Error uploading file");
    } finally {
      setUploadProgress(null);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

      await supabaseContentRepository.updatePost(id, {
        title,
        titleHi: titleHi || undefined,
        description: description || undefined,
        descriptionHi: descriptionHi || undefined,
        deity,
        category,
        language,
        tags,
        actionLabel,
        isFeatured,
        isPremium,
        status,
        scheduledAt: status === "scheduled" ? scheduledAt : undefined,
        mediaUrl: mediaUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        audioUrl: audioUrl || undefined,
      });

      router.push("/content");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating content";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF7A00]" />
        <p className="text-sm font-medium">Loading content to edit...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-16">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/content"
            className="p-2 border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Edit Content
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/content"
            className="px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
          >
            Cancel
          </Link>
          <button
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* FORM FIELDS */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Title & Localizations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Title (English) *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Title (Hindi)</label>
            <input
              type="text"
              value={titleHi}
              onChange={(e) => setTitleHi(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Description (English)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Description (Hindi)</label>
            <textarea
              rows={3}
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Deity</label>
            <select
              value={deity}
              onChange={(e) => setDeity(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              {deities.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
