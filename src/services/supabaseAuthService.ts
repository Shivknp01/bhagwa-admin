import { createClient } from "@/lib/supabase/client";
import { AdminProfile, AuthService } from "./authService";

export class SupabaseAuthService implements AuthService {
  private supabase = createClient();

  async getCurrentAdmin(): Promise<AdminProfile> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    if (userError || !user) {
      // Fallback mock profile for local UI preview if not authenticated
      return {
        id: "admin_001",
        name: "Aditya Sharma",
        email: "admin@bhagwa.app",
        role: "Super Admin",
        avatar: "https://i.pravatar.cc/150?img=68",
      };
    }

    // Verify authorized admin role in public.admin_users table
    const { data: adminRecord, error: adminError } = await this.supabase
      .from("admin_users")
      .select("id, name, email, role, is_active")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .single();

    if (adminError || !adminRecord) {
      throw new Error("Access Denied: You do not have an active administrator account.");
    }

    return {
      id: adminRecord.id,
      name: adminRecord.name,
      email: adminRecord.email,
      role: adminRecord.role,
      avatar: user.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=68",
    };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}

export const supabaseAuthService = new SupabaseAuthService();
