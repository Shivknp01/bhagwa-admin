"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Smartphone,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  AlertCircle,
  X,
} from "lucide-react";
import { ContentType, PostStatus } from "@/models/post";
import { supabaseContentRepository } from "@/repositories/supabaseContentRepository";
import { supabaseUploadService } from "@/services/supabaseUploadService";
import { cn } from "@/lib/utils";

const contentTypes: { id: ContentType; label: string; icon: React.ElementType; ctaDefault: string }[] = [
  { id: "wallpaper", label: "Wallpaper", icon: ImageIcon, ctaDefault: "Set Wallpaper" },
  { id: "video", label: "Video", icon: Video, ctaDefault: "Play Video" },
  { id: "music", label: "Music", icon: Music, ctaDefault: "Play Full Music" },
  { id: "bhajan", label: "Bhajan", icon: Music, ctaDefault: "Play Bhajan" },
  { id: "ringtone", label: "Ringtone", icon: Music, ctaDefault: "Set as Ringtone" },
  { id: "mantra", label: "Mantra", icon: FileText, ctaDefault: "Read Mantra" },
  { id: "stuti", label: "Stuti", icon: FileText, ctaDefault: "Read Stuti" },
  { id: "horoscope", label: "Horoscope", icon: Sparkles, ctaDefault: "Read Horoscope" },
  { id: "status", label: "Status", icon: ImageIcon, ctaDefault: "Share Status" },
];

const deities = ["Mahadev", "Hanuman", "Krishna", "Shri Ram", "Ganesh", "Durga", "Lakshmi", "Saraswati"];
const categories = ["Devotional", "Wallpaper", "Bhajan", "Music", "Ringtone", "Mantra", "Stuti", "Horoscope", "Status"];
const languages = ["Hindi", "English", "Sanskrit"];
const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export default function CreateContentPage() {
  const router = useRouter();

  // Form State
  const [contentType, setContentType] = useState<ContentType>("wallpaper");
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [deity, setDeity] = useState("Mahadev");
  const [category, setCategory] = useState("Devotional");
  const [language, setLanguage] = useState("Hindi");
  const [tagsInput, setTagsInput] = useState("Mahadev, Bhakti, Daily");
  const [actionLabel, setActionLabel] = useState("Set Wallpaper");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<PostStatus>("published");
  const [scheduledAt, setScheduledAt] = useState("");
  const [zodiacSign, setZodiacSign] = useState("Aries");

  // Media File Upload States
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Validation & Feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Content type change handler
  const handleTypeChange = (typeId: ContentType) => {
    setContentType(typeId);
    const item = contentTypes.find((t) => t.id === typeId);
    if (item) {
      setActionLabel(item.ctaDefault);
    }
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "media" | "thumbnail" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(10);
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";

    if (contentType === "wallpaper" && !mediaUrl && !thumbnailUrl) {
      errs.media = "Wallpaper image is required";
    }
    if (contentType === "video" && !mediaUrl) {
      errs.media = "Video file is required";
    }
    if ((contentType === "music" || contentType === "bhajan" || contentType === "ringtone") && !audioUrl && !mediaUrl) {
      errs.media = "Audio file is required";
    }
    if (status === "scheduled" && !scheduledAt) {
      errs.scheduledAt = "Schedule Date & Time is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (targetStatus: PostStatus) => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

      await supabaseContentRepository.createPost({
        contentType,
        title,
        titleHi: titleHi || undefined,
        description: description || undefined,
        descriptionHi: descriptionHi || undefined,
        thumbnailUrl: thumbnailUrl || mediaUrl || "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
        mediaUrl: mediaUrl || thumbnailUrl || undefined,
        audioUrl: audioUrl || undefined,
        deity,
        category,
        language,
        tags,
        actionType: contentType.toString(),
        actionLabel: actionLabel || "Explore 🚩",
        isFeatured,
        isPremium,
        status: targetStatus,
        scheduledAt: targetStatus === "scheduled" ? scheduledAt : undefined,
      });

      router.push("/content");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving content";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
              Create New Content
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Publish wallpapers, music, bhajans, mantras, and daily feeds to Daivik mobile app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <Smartphone className="w-4 h-4 text-[#FF7A00]" />
            <span>Preview</span>
          </button>
          <button
            disabled={submitting}
            onClick={() => handleSave("draft")}
            className="px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
          >
            Save Draft
          </button>
          <button
            disabled={submitting}
            onClick={() => handleSave("published")}
            className="inline-flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Publish Now</span>
          </button>
        </div>
      </div>

      {/* STEP 1: CONTENT TYPE SELECTION */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-3 shadow-xs">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          1. Select Content Type
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = contentType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id)}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold",
                  isSelected
                    ? "bg-[#FF7A00] text-white border-[#FF7A00] shadow-md scale-105"
                    : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate w-full text-center">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: MEDIA UPLOAD SECTION */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-4 shadow-xs">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          2. Media Upload & Artwork
        </label>

        {uploadProgress !== null && (
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#FF7A00] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Media Upload */}
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block mb-1">
              Main Media File ({contentType === "wallpaper" ? "Image" : contentType === "video" ? "Video" : "Audio / Image"})
            </span>

            {mediaUrl ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[var(--border-color)] group">
                {contentType === "video" ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={mediaUrl} alt="Upload" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaUrl("")}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[var(--border-color)] hover:border-[#FF7A00] p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center h-40">
                <Upload className="w-6 h-6 text-[#FF7A00] mb-2" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Drag & drop or Click to upload</span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-1">Supports JPG, PNG, MP4, MP3 (Max 50MB)</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, "media")}
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                />
              </label>
            )}
            {errors.media && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.media}</p>}
          </div>

          {/* Secondary Artwork / Audio Upload */}
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block mb-1">
              {contentType === "video" ? "Video Thumbnail" : "Audio File / Artwork"}
            </span>

            {audioUrl || thumbnailUrl ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-50 dark:bg-slate-900 p-4 flex flex-col items-center justify-center text-center">
                {audioUrl && (
                  <div className="space-y-2 w-full">
                    <Music className="w-8 h-8 text-[#FF7A00] mx-auto animate-bounce" />
                    <audio src={audioUrl} controls className="w-full h-8" />
                  </div>
                )}
                {thumbnailUrl && (
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setAudioUrl("");
                    setThumbnailUrl("");
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[var(--border-color)] hover:border-[#FF7A00] p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center h-40">
                <Music className="w-6 h-6 text-[#FF7A00] mb-2" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Upload Audio / Thumbnail</span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-1">MP3, WAV, JPG, PNG</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, contentType === "video" ? "thumbnail" : "audio")}
                  className="hidden"
                  accept="audio/*,image/*"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* STEP 3: CONTENT DETAILS & METADATA */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-4 shadow-xs">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          3. Title, Description & Localizations
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Title (English) *</label>
            <input
              type="text"
              placeholder="e.g. Mahadev Divine Wallpaper"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Title (Hindi - optional)</label>
            <input
              type="text"
              placeholder="e.g. महादेव दिव्य वॉलपेपर"
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
              placeholder="Short devotional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Description (Hindi)</label>
            <textarea
              rows={3}
              placeholder="हिंदी विवरण..."
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>
        </div>

        {/* CLASSIFICATION DROPDOWNS */}
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
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TAGS & CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">CTA Action Button Label</label>
            <input
              type="text"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>
        </div>
      </div>

      {/* STEP 4: PUBLISHING & SCHEDULING OPTIONS */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl space-y-4 shadow-xs">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          4. Publishing & Access Controls
        </label>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
            />
            <span>Mark as Featured Post</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="rounded border-[var(--border-color)] text-[#FF7A00] focus:ring-[#FF7A00]"
            />
            <span>Premium Subscriber Only</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Publish Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="published">Publish Immediately</option>
              <option value="draft">Save as Draft</option>
              <option value="scheduled">Schedule for Future</option>
            </select>
          </div>

          {status === "scheduled" && (
            <div>
              <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF7A00]"
              />
              {errors.scheduledAt && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.scheduledAt}</p>}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
                Live Mobile Preview
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {title || "Untitled Post"}
              </h3>
            </div>

            <div className="w-full bg-[#0F0906] text-white rounded-3xl border-4 border-slate-800 p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <img src="/daivik_logo.png" alt="Daivik" className="w-5 h-5 rounded-full" />
                  <span className="text-xs font-extrabold text-[#FF7A00]">Daivik — Bhakti</span>
                </div>
                <span className="text-[10px] bg-[#FF7A00]/20 text-[#FF7A00] px-2 py-0.5 rounded-full font-bold">
                  {contentType.toUpperCase()}
                </span>
              </div>

              <div className="w-full h-44 rounded-2xl bg-black overflow-hidden relative border border-white/10 flex items-center justify-center">
                {mediaUrl || thumbnailUrl ? (
                  <img src={mediaUrl || thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl">🚩</span>
                    <p className="text-xs text-amber-200 mt-2 font-bold">{title || "Devotional Post"}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-white/80 line-clamp-2">
                {description || "Experience divine peace and daily devotional feeds."}
              </p>

              <div className="w-full py-2.5 bg-[#FF7A00] rounded-xl text-center text-white text-xs font-bold shadow-md">
                {actionLabel || "Explore 🚩"}
              </div>
            </div>

            <button
              onClick={() => setShowPreview(false)}
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
