import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fyhtlazvmvsdgsrndoxh.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aHRsYXp2bXZzZGdzcm5kb3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxODMzNywiZXhwIjoyMTAyMzk0MzM3fQ.tqLbLiAoiID_sgvTE0XdvGBfHdq0XtMseebqu9jVo64";

export async function POST(req: Request) {
  try {
    const { token, platform, userId } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "FCM token required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    let validUserId = userId;

    // If no userId provided, get default profile ID
    if (!validUserId) {
      const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
      if (profile) validUserId = profile.id;
    }

    if (!validUserId) {
      return NextResponse.json({ error: "No profile ID found for user_devices" }, { status: 400 });
    }

    // Upsert FCM token into user_devices table
    const { data, error } = await supabase
      .from("user_devices")
      .upsert(
        {
          user_id: validUserId,
          fcm_token: token,
          platform: platform || "android",
          is_active: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "fcm_token" }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error("[device-token] Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from("user_devices")
      .select("fcm_token, platform, user_id, last_seen_at")
      .eq("is_active", true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [], count: data?.length || 0 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
