import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, imageUrl, actionUrl, targetAudience } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and Message are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fyhtlazvmvsdgsrndoxh.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabase = createClient(supabaseUrl, serviceRoleKey);

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
      console.error("Error inserting notification campaign:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("API error broadcasting notification:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
