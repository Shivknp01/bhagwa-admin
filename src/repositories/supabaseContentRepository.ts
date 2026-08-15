import { createClient } from "@/lib/supabase/client";
import { Post, CreatePostInput, UpdatePostInput, EngagementMetrics, ContentType } from "@/models/post";
import { ContentRepository, ContentFilterOptions, PaginatedPostsResult } from "./contentRepository";
import { initialMockPosts } from "@/data/mock/posts";

export class SupabaseContentRepository implements ContentRepository {
  private supabase = createClient();

  private getActionLabel(contentType: ContentType): { actionType: string; actionLabel: string } {
    switch (contentType.toLowerCase()) {
      case "wallpaper":
        return { actionType: "setWallpaper", actionLabel: "Set Wallpaper" };
      case "music":
        return { actionType: "playMusic", actionLabel: "Play Full Music" };
      case "bhajan":
        return { actionType: "playBhajan", actionLabel: "Play Bhajan" };
      case "ringtone":
        return { actionType: "setRingtone", actionLabel: "Set as Ringtone" };
      case "mantra":
        return { actionType: "readMantra", actionLabel: "Read Mantra" };
      case "stuti":
        return { actionType: "readStuti", actionLabel: "Read Stuti" };
      case "horoscope":
        return { actionType: "readHoroscope", actionLabel: "Read Horoscope" };
      case "status":
      default:
        return { actionType: "shareStatus", actionLabel: "Share Status" };
    }
  }

  async getPosts(categoryOrType?: string, searchQuery?: string): Promise<Post[]> {
    try {
      let query = this.supabase.from("posts").select("*");

      if (categoryOrType && categoryOrType.toLowerCase() !== "all") {
        query = query.eq("content_type", categoryOrType.toLowerCase());
      }

      if (searchQuery && searchQuery.trim() !== "") {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return initialMockPosts;
      }

      return data.map((row) => this.mapRowToPost(row));
    } catch {
      return initialMockPosts;
    }
  }

  async getFilteredPosts(options: ContentFilterOptions): Promise<PaginatedPostsResult> {
    try {
      let query = this.supabase.from("posts").select("*", { count: "exact" });

      // Tab filter
      if (options.tab && options.tab.toLowerCase() !== "all") {
        query = query.eq("content_type", options.tab.toLowerCase());
      }

      // Content Type filter
      if (options.contentType && options.contentType.toLowerCase() !== "all") {
        query = query.eq("content_type", options.contentType.toLowerCase());
      }

      // Search Query
      if (options.searchQuery && options.searchQuery.trim() !== "") {
        const q = `%${options.searchQuery.trim()}%`;
        query = query.or(`title.ilike.${q},description.ilike.${q}`);
      }

      // Status
      if (options.status && options.status.toLowerCase() !== "all") {
        query = query.eq("status", options.status.toLowerCase());
      }

      // Language
      if (options.language && options.language.toLowerCase() !== "all") {
        query = query.eq("language", options.language);
      }

      // Featured
      if (options.featured && options.featured !== "all") {
        query = query.eq("is_featured", options.featured === "featured");
      }

      // Premium
      if (options.premium && options.premium !== "all") {
        query = query.eq("is_premium", options.premium === "premium");
      }

      // Date Range
      if (options.dateRange && options.dateRange !== "all") {
        const now = new Date();
        let startDate: Date | null = null;
        if (options.dateRange === "today") {
          startDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (options.dateRange === "7d") {
          startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (options.dateRange === "30d") {
          startDate = new Date(now.setDate(now.getDate() - 30));
        } else if (options.dateRange === "custom" && options.startDate) {
          startDate = new Date(options.startDate);
        }

        if (startDate) {
          query = query.gte("created_at", startDate.toISOString());
        }
        if (options.dateRange === "custom" && options.endDate) {
          query = query.lte("created_at", new Date(options.endDate).toISOString());
        }
      }

      // Pagination
      const page = options.page || 1;
      const pageSize = options.pageSize || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order("feed_priority", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error || !data) {
        // Fallback to mock filtering
        const mockRepo = new (await import("./contentRepository")).MockContentRepository();
        return mockRepo.getFilteredPosts(options);
      }

      const posts = data.map((row) => this.mapRowToPost(row));
      return { posts, totalCount: count || posts.length };
    } catch {
      const mockRepo = new (await import("./contentRepository")).MockContentRepository();
      return mockRepo.getFilteredPosts(options);
    }
  }

  async getPostById(id: string): Promise<Post | undefined> {
    try {
      const { data, error } = await this.supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return initialMockPosts.find((p) => p.id === id);
      }

      return this.mapRowToPost(data);
    } catch {
      return initialMockPosts.find((p) => p.id === id);
    }
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const cta = this.getActionLabel(input.contentType);

    const insertData = {
      content_type: input.contentType.toLowerCase(),
      title: input.title,
      title_hi: input.titleHi,
      description: input.description,
      description_hi: input.descriptionHi,
      language: input.language || "Hindi",
      tags: input.tags || [],
      action_type: input.actionType || cta.actionType,
      action_label: input.actionLabel || cta.actionLabel,
      action_label_hi: input.actionLabelHi,
      author_name: input.authorName || "Bhakti Media",
      thumbnail_url: input.thumbnailUrl,
      media_url: input.mediaUrl,
      audio_url: input.audioUrl,
      duration_text: input.durationText,
      is_featured: input.isFeatured || false,
      is_pinned: input.isPinned || false,
      is_premium: input.isPremium || false,
      status: input.status || "published",
      feed_priority: input.feedPriority || 0,
      scheduled_at: input.scheduledAt,
    };

    const { data, error } = await this.supabase
      .from("posts")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create post in Supabase: ${error?.message}`);
    }

    return this.mapRowToPost(data);
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.titleHi !== undefined) updateData.title_hi = input.titleHi;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.descriptionHi !== undefined) updateData.description_hi = input.descriptionHi;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured;
    if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;
    if (input.isPremium !== undefined) updateData.is_premium = input.isPremium;
    if (input.feedPriority !== undefined) updateData.feed_priority = input.feedPriority;
    if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl;
    if (input.mediaUrl !== undefined) updateData.media_url = input.mediaUrl;
    if (input.audioUrl !== undefined) updateData.audio_url = input.audioUrl;
    if (input.actionType !== undefined) updateData.action_type = input.actionType;
    if (input.actionLabel !== undefined) updateData.action_label = input.actionLabel;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.scheduledAt !== undefined) updateData.scheduled_at = input.scheduledAt;

    if (input.engagement) {
      const e = input.engagement;
      if (e.viewOverride !== undefined) updateData.view_override = e.viewOverride;
      if (e.likeOverride !== undefined) updateData.like_override = e.likeOverride;
      if (e.commentOverride !== undefined) updateData.comment_override = e.commentOverride;
      if (e.shareOverride !== undefined) updateData.share_override = e.shareOverride;
      if (e.saveOverride !== undefined) updateData.save_override = e.saveOverride;
      if (e.viewsOverrideEnabled !== undefined) updateData.views_override_enabled = e.viewsOverrideEnabled;
      if (e.likesOverrideEnabled !== undefined) updateData.likes_override_enabled = e.likesOverrideEnabled;
      if (e.commentsOverrideEnabled !== undefined) updateData.comments_override_enabled = e.commentsOverrideEnabled;
      if (e.sharesOverrideEnabled !== undefined) updateData.shares_override_enabled = e.sharesOverrideEnabled;
      if (e.savesOverrideEnabled !== undefined) updateData.saves_override_enabled = e.savesOverrideEnabled;
    }

    const { data, error } = await this.supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update post ${id}: ${error?.message}`);
    }

    return this.mapRowToPost(data);
  }

  async deletePost(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("posts").delete().eq("id", id);
    return !error;
  }

  async duplicatePost(id: string): Promise<Post> {
    const orig = await this.getPostById(id);
    if (!orig) throw new Error("Original post not found");

    return this.createPost({
      contentType: orig.contentType,
      title: `${orig.title} (Copy)`,
      titleHi: orig.titleHi,
      description: orig.description,
      descriptionHi: orig.descriptionHi,
      thumbnailUrl: orig.thumbnailUrl,
      mediaUrl: orig.mediaUrl,
      audioUrl: orig.audioUrl,
      durationText: orig.durationText,
      deity: orig.deity,
      category: orig.category,
      language: orig.language,
      tags: orig.tags,
      actionType: orig.actionType,
      actionLabel: orig.actionLabel,
      actionLabelHi: orig.actionLabelHi,
      isFeatured: false,
      isPinned: false,
      isPremium: orig.isPremium,
      status: "draft",
    });
  }

  async bulkUpdateStatus(ids: string[], status: "published" | "draft" | "archived"): Promise<void> {
    const { error } = await this.supabase
      .from("posts")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) throw new Error(`Bulk status update failed: ${error.message}`);
  }

  async bulkToggleFeatured(ids: string[], isFeatured: boolean): Promise<void> {
    const { error } = await this.supabase
      .from("posts")
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) throw new Error(`Bulk feature update failed: ${error.message}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const { error } = await this.supabase.from("posts").delete().in("id", ids);
    if (error) throw new Error(`Bulk delete failed: ${error.message}`);
  }

  async updateEngagementMetrics(id: string, metrics: Partial<EngagementMetrics>): Promise<Post> {
    return this.updatePost(id, { engagement: metrics as Partial<EngagementMetrics> });
  }

  async resetEngagementOverride(id: string): Promise<Post> {
    const resetData = {
      view_override: null,
      like_override: null,
      comment_override: null,
      share_override: null,
      save_override: null,
      views_override_enabled: false,
      likes_override_enabled: false,
      comments_override_enabled: false,
      shares_override_enabled: false,
      saves_override_enabled: false,
    };

    const { data, error } = await this.supabase
      .from("posts")
      .update(resetData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message);
    return this.mapRowToPost(data);
  }

  async bulkUpdateEngagement(ids: string[], deltas: { views?: number; likes?: number; comments?: number; shares?: number; saves?: number }): Promise<void> {
    for (const id of ids) {
      const p = await this.getPostById(id);
      if (!p) continue;
      await this.updatePost(id, {
        engagement: {
          ...p.engagement,
          actualViews: p.engagement.actualViews + (deltas.views || 0),
          actualLikes: p.engagement.actualLikes + (deltas.likes || 0),
          actualComments: p.engagement.actualComments + (deltas.comments || 0),
          actualShares: p.engagement.actualShares + (deltas.shares || 0),
          actualSaves: p.engagement.actualSaves + (deltas.saves || 0),
        },
      });
    }
  }

  async reorderFeed(postIds: string[]): Promise<void> {
    for (let index = 0; index < postIds.length; index++) {
      const id = postIds[index];
      await this.supabase
        .from("posts")
        .update({ feed_priority: postIds.length - index })
        .eq("id", id);
    }
  }

  private mapRowToPost(row: Record<string, unknown>): Post {
    return {
      id: row.id as string,
      contentType: (row.content_type as ContentType) || "status",
      title: row.title as string,
      titleHi: row.title_hi as string,
      description: row.description as string,
      descriptionHi: row.description_hi as string,
      deity: "Mahadev",
      category: "Devotional",
      language: (row.language as string) || "Hindi",
      tags: (row.tags as string[]) || [],
      actionType: (row.action_type as string) || "shareStatus",
      actionLabel: (row.action_label as string) || "Share Status",
      authorName: (row.author_name as string) || "Bhakti Media",
      thumbnailUrl: row.thumbnail_url as string,
      mediaUrl: row.media_url as string,
      audioUrl: row.audio_url as string,
      engagement: {
        actualViews: (row.actual_views as number) || 0,
        actualLikes: (row.actual_likes as number) || 0,
        actualComments: (row.actual_comments as number) || 0,
        actualShares: (row.actual_shares as number) || 0,
        actualSaves: (row.actual_saves as number) || 0,
        actualAudioPlays: (row.actual_audio_plays as number) || 0,
        actualWallpaperSets: (row.actual_wallpaper_sets as number) || 0,
        actualRingtoneSets: (row.actual_ringtone_sets as number) || 0,

        viewOverride: row.view_override as number | undefined,
        likeOverride: row.like_override as number | undefined,
        commentOverride: row.comment_override as number | undefined,
        shareOverride: row.share_override as number | undefined,
        saveOverride: row.save_override as number | undefined,

        viewsOverrideEnabled: (row.views_override_enabled as boolean) || false,
        likesOverrideEnabled: (row.likes_override_enabled as boolean) || false,
        commentsOverrideEnabled: (row.comments_override_enabled as boolean) || false,
        sharesOverrideEnabled: (row.shares_override_enabled as boolean) || false,
        savesOverrideEnabled: (row.saves_override_enabled as boolean) || false,
        audioPlaysOverrideEnabled: false,
        wallpaperSetsOverrideEnabled: false,
        ringtoneSetsOverrideEnabled: false,
      },
      isFeatured: (row.is_featured as boolean) || false,
      isPinned: (row.is_pinned as boolean) || false,
      isPremium: (row.is_premium as boolean) || false,
      status: (row.status as "published" | "draft" | "scheduled" | "archived") || "published",
      feedPriority: (row.feed_priority as number) || 0,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

export const supabaseContentRepository = new SupabaseContentRepository();
