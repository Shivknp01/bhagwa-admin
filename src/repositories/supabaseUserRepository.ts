import { createClient } from "@/lib/supabase/client";
import { User } from "@/models/user";
import { UserRepository } from "./userRepository";
import { initialMockUsers } from "@/data/mock/users";

export class SupabaseUserRepository implements UserRepository {
  private supabase = createClient();

  async getUsers(query?: string, statusFilter?: string): Promise<User[]> {
    try {
      let q = this.supabase.from("profiles").select("*");

      if (statusFilter && statusFilter !== "all") {
        q = q.eq("status", statusFilter);
      }

      if (query && query.trim() !== "") {
        q = q.ilike("display_name", `%${query}%`);
      }

      const { data, error } = await q.order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return initialMockUsers;
      }

      return data.map((row) => this.mapRowToUser(row));
    } catch {
      return initialMockUsers;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return initialMockUsers.find((u) => u.id === id);
      }

      return this.mapRowToUser(data);
    } catch {
      return initialMockUsers.find((u) => u.id === id);
    }
  }

  async updateUserStatus(id: string, status: "active" | "inactive" | "banned"): Promise<User> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update user status: ${error?.message}`);
    }

    return this.mapRowToUser(data);
  }

  private mapRowToUser(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      name: (row.display_name as string) || "Devotee",
      identifier: (row.email as string) || (row.phone_number as string) || "user@bhagwa.app",
      avatar: (row.avatar_url as string) || "https://i.pravatar.cc/150",
      status: (row.status as "active" | "inactive" | "banned") || "active",
      language: (row.language as string) || "Hindi",
      isPremium: (row.is_premium as boolean) || false,
      registeredAt: row.created_at as string,
      lastActiveAt: (row.last_active_at as string) || (row.created_at as string),
      device: "Android App",
      favoriteDeities: ["Mahadev", "Hanuman"],
      contentInterests: ["Wallpapers", "Bhajans"],
      appVersion: "1.0.0",
      referralSource: "WhatsApp",
      engagementStats: {
        postsViewed: 120,
        likesGiven: 45,
        commentsMade: 14,
        sharesCount: 28,
        savesCount: 32,
        audioPlaysCount: 65,
        wallpaperSetsCount: 12,
        ringtoneSetsCount: 4,
      },
      recentActivity: [],
    };
  }
}

export const supabaseUserRepository = new SupabaseUserRepository();
