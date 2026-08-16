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

    // Upsert FCM token - use token as unique key
    const { data, error } = await supabase
      .from("device_tokens")
      .upsert(
        {
          fcm_token: token,
          platform: platform || "android",
          user_id: userId || null,
          last_seen: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "fcm_token" }
      )
      .select()
      .single();

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
      .from("device_tokens")
      .select("fcm_token, platform, user_id, last_seen")
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
