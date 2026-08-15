import { Post, CreatePostInput, UpdatePostInput, EngagementMetrics } from "@/models/post";
import { initialMockPosts } from "@/data/mock/posts";

export interface ContentRepository {
  getPosts(categoryOrType?: string, searchQuery?: string): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(input: CreatePostInput): Promise<Post>;
  updatePost(id: string, input: UpdatePostInput): Promise<Post>;
  deletePost(id: string): Promise<boolean>;
  updateEngagementMetrics(id: string, metrics: Partial<EngagementMetrics>): Promise<Post>;
  resetEngagementOverride(id: string): Promise<Post>;
  bulkUpdateEngagement(ids: string[], deltas: { views?: number; likes?: number; comments?: number; shares?: number; saves?: number }): Promise<void>;
  reorderFeed(postIds: string[]): Promise<void>;
}

class MockContentRepository implements ContentRepository {
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
    const initialLen = this.posts.length;
    this.posts = this.posts.filter((p) => p.id !== id);
    return this.posts.length < initialLen;
  }

  async updateEngagementMetrics(id: string, metrics: Partial<EngagementMetrics>): Promise<Post> {
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Post with id ${id} not found`);
    }

    const current = this.posts[index];
    const updated: Post = {
      ...current,
      engagement: {
        ...current.engagement,
        ...metrics,
      },
      updatedAt: new Date().toISOString(),
    };

    this.posts[index] = updated;
    return updated;
  }

  async resetEngagementOverride(id: string): Promise<Post> {
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Post with id ${id} not found`);
    }

    const current = this.posts[index];
    const updated: Post = {
      ...current,
      engagement: {
        ...current.engagement,
        viewOverride: undefined,
        likeOverride: undefined,
        commentOverride: undefined,
        shareOverride: undefined,
        saveOverride: undefined,
        audioPlayOverride: undefined,
        wallpaperSetOverride: undefined,
        ringtoneSetOverride: undefined,
        viewsOverrideEnabled: false,
        likesOverrideEnabled: false,
        commentsOverrideEnabled: false,
        sharesOverrideEnabled: false,
        savesOverrideEnabled: false,
        audioPlaysOverrideEnabled: false,
        wallpaperSetsOverrideEnabled: false,
        ringtoneSetsOverrideEnabled: false,
      },
      updatedAt: new Date().toISOString(),
    };

    this.posts[index] = updated;
    return updated;
  }

  async bulkUpdateEngagement(
    ids: string[],
    deltas: { views?: number; likes?: number; comments?: number; shares?: number; saves?: number }
  ): Promise<void> {
    this.posts = this.posts.map((p) => {
      if (ids.includes(p.id)) {
        const eng = p.engagement;
        return {
          ...p,
          engagement: {
            ...eng,
            viewOverride: deltas.views !== undefined ? (eng.viewOverride ?? eng.actualViews) + deltas.views : eng.viewOverride,
            likeOverride: deltas.likes !== undefined ? (eng.likeOverride ?? eng.actualLikes) + deltas.likes : eng.likeOverride,
            commentOverride: deltas.comments !== undefined ? (eng.commentOverride ?? eng.actualComments) + deltas.comments : eng.commentOverride,
            shareOverride: deltas.shares !== undefined ? (eng.shareOverride ?? eng.actualShares) + deltas.shares : eng.shareOverride,
            saveOverride: deltas.saves !== undefined ? (eng.saveOverride ?? eng.actualSaves) + deltas.saves : eng.saveOverride,
            viewsOverrideEnabled: deltas.views !== undefined ? true : eng.viewsOverrideEnabled,
            likesOverrideEnabled: deltas.likes !== undefined ? true : eng.likesOverrideEnabled,
            commentsOverrideEnabled: deltas.comments !== undefined ? true : eng.commentsOverrideEnabled,
            sharesOverrideEnabled: deltas.shares !== undefined ? true : eng.sharesOverrideEnabled,
            savesOverrideEnabled: deltas.saves !== undefined ? true : eng.savesOverrideEnabled,
          },
        };
      }
      return p;
    });
  }

  async reorderFeed(postIds: string[]): Promise<void> {
    const reordered: Post[] = [];
    for (const id of postIds) {
      const found = this.posts.find((p) => p.id === id);
      if (found) reordered.push(found);
    }
    // Append any posts not explicitly listed
    for (const p of this.posts) {
      if (!postIds.includes(p.id)) reordered.push(p);
    }
    this.posts = reordered;
  }
}

export const contentRepository: ContentRepository = new MockContentRepository();
