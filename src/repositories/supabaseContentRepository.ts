import { createClient } from "@/lib/supabase/client";
import { Post, CreatePostInput, UpdatePostInput, EngagementMetrics, ContentType } from "@/models/post";
import { ContentRepository } from "./contentRepository";
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
      action_type: cta.actionType,
      action_label: cta.actionLabel,
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
      title: input.title,
      description: input.description,
      status: input.status,
      is_featured: input.isFeatured,
      is_pinned: input.isPinned,
      is_premium: input.isPremium,
      feed_priority: input.feedPriority,
      updated_at: new Date().toISOString(),
    };

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

  async bulkUpdateEngagement(): Promise<void> {
    // Implementation placeholder
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
      language: row.language as string || "Hindi",
      tags: (row.tags as string[]) || [],
      actionType: row.action_type as string || "shareStatus",
      actionLabel: row.action_label as string || "Share Status",
      authorName: row.author_name as string || "Bhakti Media",
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
      status: row.status as "published" | "draft" | "scheduled" | "archived" || "published",
      feedPriority: (row.feed_priority as number) || 0,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

export const supabaseContentRepository = new SupabaseContentRepository();
