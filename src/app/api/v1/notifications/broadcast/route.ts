import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fyhtlazvmvsdgsrndoxh.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aHRsYXp2bXZzZGdzcm5kb3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxODMzNywiZXhwIjoyMTAyMzk0MzM3fQ.tqLbLiAoiID_sgvTE0XdvGBfHdq0XtMseebqu9jVo64";

// GET: Fetch all notification_campaigns for mobile app / admin list view
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from("notification_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[broadcast GET] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Broadcast a new notification
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // Accept BOTH 'body' (from CreateNotificationInput) AND 'message' field
    const title: string = (rawBody.title || "").trim();
    const message: string = (rawBody.body || rawBody.message || "").trim();
    const imageUrl: string = (rawBody.imageUrl || rawBody.image_url || "").trim();
    const actionUrl: string = (rawBody.actionUrl || rawBody.action_url || rawBody.deep_link || "").trim();
    const targetAudience: string = rawBody.targetAudience || rawBody.target_audience || "all";

    // Validation
    if (!title) {
      return NextResponse.json({ error: "Notification Title is required" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "Message Body is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_ROLE_KEY;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const payload: Record<string, unknown> = {
      title,
      message,
      audience: targetAudience === "premium" ? "Premium Devotees" : "All Users",
      status: "sent",
      sent_at: new Date().toISOString(),
    };

    if (imageUrl) payload.image_url = imageUrl;
    if (actionUrl) payload.deep_link = actionUrl;

    const { data, error } = await supabase
      .from("notification_campaigns")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[broadcast POST] Supabase insert error:", JSON.stringify(error));
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("[broadcast POST] Success, id:", data?.id);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[broadcast POST] Unhandled exception:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
