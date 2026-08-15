import { Post, CreatePostInput, UpdatePostInput, EngagementMetrics } from "@/models/post";
import { initialMockPosts } from "@/data/mock/posts";

export interface ContentFilterOptions {
  tab?: string;
  searchQuery?: string;
  contentType?: string;
  deity?: string;
  category?: string;
  language?: string;
  status?: string;
  featured?: string;
  premium?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedPostsResult {
  posts: Post[];
  totalCount: number;
}

export interface ContentRepository {
  getPosts(categoryOrType?: string, searchQuery?: string): Promise<Post[]>;
  getFilteredPosts(options: ContentFilterOptions): Promise<PaginatedPostsResult>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(input: CreatePostInput): Promise<Post>;
  updatePost(id: string, input: UpdatePostInput): Promise<Post>;
  deletePost(id: string): Promise<boolean>;
  duplicatePost(id: string): Promise<Post>;
  bulkUpdateStatus(ids: string[], status: "published" | "draft" | "archived"): Promise<void>;
  bulkToggleFeatured(ids: string[], isFeatured: boolean): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  updateEngagementMetrics(id: string, metrics: Partial<EngagementMetrics>): Promise<Post>;
  resetEngagementOverride(id: string): Promise<Post>;
  bulkUpdateEngagement(ids: string[], deltas: { views?: number; likes?: number; comments?: number; shares?: number; saves?: number }): Promise<void>;
  reorderFeed(postIds: string[]): Promise<void>;
}

export class MockContentRepository implements ContentRepository {
  private posts: Post[] = [...initialMockPosts];

  async getPosts(categoryOrType?: string, searchQuery?: string): Promise<Post[]> {
    let result = [...this.posts];

    if (categoryOrType && categoryOrType.toLowerCase() !== "all") {
      result = result.filter(
        (p) =>
          p.contentType.toLowerCase() === categoryOrType.toLowerCase() ||
          p.category?.toLowerCase() === categoryOrType.toLowerCase()
      );
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.deity?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  async getFilteredPosts(options: ContentFilterOptions): Promise<PaginatedPostsResult> {
    let result = [...this.posts];

    if (options.tab && options.tab.toLowerCase() !== "all") {
      const tabLower = options.tab.toLowerCase();
      result = result.filter((p) => p.contentType.toLowerCase() === tabLower);
    }

    if (options.contentType && options.contentType.toLowerCase() !== "all") {
      const ctLower = options.contentType.toLowerCase();
      result = result.filter((p) => p.contentType.toLowerCase() === ctLower);
    }

    if (options.searchQuery && options.searchQuery.trim() !== "") {
      const q = options.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.deity?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (options.deity && options.deity.toLowerCase() !== "all") {
      result = result.filter((p) => p.deity?.toLowerCase() === options.deity?.toLowerCase());
    }

    if (options.category && options.category.toLowerCase() !== "all") {
      result = result.filter((p) => p.category?.toLowerCase() === options.category?.toLowerCase());
    }

    if (options.language && options.language.toLowerCase() !== "all") {
      result = result.filter((p) => p.language?.toLowerCase() === options.language?.toLowerCase());
    }

    if (options.status && options.status.toLowerCase() !== "all") {
      result = result.filter((p) => p.status.toLowerCase() === options.status?.toLowerCase());
    }

    if (options.featured && options.featured !== "all") {
      const isF = options.featured === "featured";
      result = result.filter((p) => p.isFeatured === isF);
    }

    if (options.premium && options.premium !== "all") {
      const isP = options.premium === "premium";
      result = result.filter((p) => p.isPremium === isP);
    }

    const totalCount = result.length;
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginated = result.slice(startIndex, startIndex + pageSize);

    return { posts: paginated, totalCount };
  }

  async getPostById(id: string): Promise<Post | undefined> {
    return this.posts.find((p) => p.id === id);
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      ...input,
      engagement: {
        actualViews: 0,
        actualLikes: 0,
        actualComments: 0,
        actualShares: 0,
        actualSaves: 0,
        actualAudioPlays: 0,
        actualWallpaperSets: 0,
        actualRingtoneSets: 0,
        viewsOverrideEnabled: false,
        likesOverrideEnabled: false,
        commentsOverrideEnabled: false,
        sharesOverrideEnabled: false,
        savesOverrideEnabled: false,
        audioPlaysOverrideEnabled: false,
        wallpaperSetsOverrideEnabled: false,
        ringtoneSetsOverrideEnabled: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.posts.unshift(newPost);
    return newPost;
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Post with id ${id} not found`);
    }

    const current = this.posts[index];
    const updated: Post = {
      ...current,
      ...input,
      engagement: input.engagement
        ? { ...current.engagement, ...input.engagement }
        : current.engagement,
      updatedAt: new Date().toISOString(),
    };

    this.posts[index] = updated;
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    this.posts = this.posts.filter((p) => p.id !== id);
    return true;
  }

  async duplicatePost(id: string): Promise<Post> {
    const orig = await this.getPostById(id);
    if (!orig) throw new Error("Original post not found");

    const copy: Post = {
      ...orig,
      id: `post_copy_${Date.now()}`,
      title: `${orig.title} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.posts.unshift(copy);
    return copy;
  }

  async bulkUpdateStatus(ids: string[], status: "published" | "draft" | "archived"): Promise<void> {
    this.posts = this.posts.map((p) => (ids.includes(p.id) ? { ...p, status } : p));
  }

  async bulkToggleFeatured(ids: string[], isFeatured: boolean): Promise<void> {
    this.posts = this.posts.map((p) => (ids.includes(p.id) ? { ...p, isFeatured } : p));
  }

  async bulkDelete(ids: string[]): Promise<void> {
    this.posts = this.posts.filter((p) => !ids.includes(p.id));
  }

  async updateEngagementMetrics(id: string, metrics: Partial<EngagementMetrics>): Promise<Post> {
    return this.updatePost(id, { engagement: metrics });
  }

  async resetEngagementOverride(id: string): Promise<Post> {
    const p = await this.getPostById(id);
    if (!p) throw new Error("Post not found");
    return this.updatePost(id, {
      engagement: {
        ...p.engagement,
        viewOverride: undefined,
        likeOverride: undefined,
        commentOverride: undefined,
        shareOverride: undefined,
        saveOverride: undefined,
        viewsOverrideEnabled: false,
        likesOverrideEnabled: false,
        commentsOverrideEnabled: false,
        sharesOverrideEnabled: false,
        savesOverrideEnabled: false,
      },
    });
  }

  async bulkUpdateEngagement(ids: string[], deltas: { views?: number; likes?: number; comments?: number; shares?: number; saves?: number }): Promise<void> {
    this.posts = this.posts.map((p) => {
      if (!ids.includes(p.id)) return p;
      const e = p.engagement;
      return {
        ...p,
        engagement: {
          ...e,
          actualViews: e.actualViews + (deltas.views || 0),
          actualLikes: e.actualLikes + (deltas.likes || 0),
          actualComments: e.actualComments + (deltas.comments || 0),
          actualShares: e.actualShares + (deltas.shares || 0),
          actualSaves: e.actualSaves + (deltas.saves || 0),
        },
      };
    });
  }

  async reorderFeed(postIds: string[]): Promise<void> {
    const map = new Map<string, number>();
    postIds.forEach((id, idx) => map.set(id, postIds.length - idx));
    this.posts = this.posts.map((p) => (map.has(p.id) ? { ...p, feedPriority: map.get(p.id)! } : p));
  }
}
