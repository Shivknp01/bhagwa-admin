import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getMessaging } from "@/lib/firebase-admin";
import type { MulticastMessage, Notification } from "firebase-admin/messaging";

const SUPABASE_URL = "https://fyhtlazvmvsdgsrndoxh.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aHRsYXp2bXZzZGdzcm5kb3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxODMzNywiZXhwIjoyMTAyMzk0MzM3fQ.tqLbLiAoiID_sgvTE0XdvGBfHdq0XtMseebqu9jVo64";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

// ────────────────────────────────────────────────────────────────────────────
// GET — Fetch all notifications for history page + mobile app
// ────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("notification_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[broadcast GET] error:", error);
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

// ────────────────────────────────────────────────────────────────────────────
// POST — Broadcast notification: Save to DB + send FCM push to all tokens
// ────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // Accept both 'body' (from CreateNotificationInput) and 'message'
    const title: string = (rawBody.title || "").trim();
    const message: string = (rawBody.body || rawBody.message || "").trim();
    const imageUrl: string = (rawBody.imageUrl || rawBody.image_url || "").trim();
    const actionUrl: string = (rawBody.actionUrl || rawBody.action_url || rawBody.deep_link || "").trim();
    const targetAudience: string = rawBody.targetAudience || rawBody.target_audience || "all";

    if (!title) {
      return NextResponse.json({ error: "Notification Title is required" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "Message Body is required" }, { status: 400 });
    }

    const db = supabase();

    // 1. Save to notification_campaigns table
    const payload: Record<string, unknown> = {
      title,
      message,
      audience: targetAudience === "premium" ? "Premium Devotees" : "All Users",
      status: "sent",
      sent_at: new Date().toISOString(),
    };
    if (imageUrl) payload.image_url = imageUrl;
    if (actionUrl) payload.deep_link = actionUrl;

    const { data: campaign, error: insertErr } = await db
      .from("notification_campaigns")
      .insert(payload)
      .select()
      .single();

    if (insertErr) {
      console.error("[broadcast POST] DB insert error:", insertErr);
      return NextResponse.json({ error: `Database error: ${insertErr.message}` }, { status: 500 });
    }

    console.log("[broadcast POST] Campaign saved id:", campaign?.id);

    // 2. Fetch all active device tokens from device_tokens table
    let fcmResult = { sent: 0, failed: 0, tokens: 0, error: "" };
    try {
      const { data: tokens, error: tokensErr } = await db
        .from("device_tokens")
        .select("fcm_token")
        .eq("is_active", true);

      if (tokensErr) {
        fcmResult.error = `Could not fetch tokens: ${tokensErr.message}`;
        console.error("[broadcast POST] Tokens fetch error:", tokensErr);
      } else if (tokens && tokens.length > 0) {
        fcmResult.tokens = tokens.length;

        // 3. Send FCM multicast push notification
        const messaging = getMessaging();

        // Build notification object
        const notification: Notification = { title, body: message };
        if (imageUrl) notification.imageUrl = imageUrl;

        // Build data payload
        const dataPayload: Record<string, string> = {
          title,
          body: message,
          campaign_id: campaign.id,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        };
        if (actionUrl) dataPayload.action_url = actionUrl;

        // FCM allows max 500 tokens per multicast
        const tokenChunks: string[][] = [];
        const allTokens = tokens.map((t: { fcm_token: string }) => t.fcm_token);
        for (let i = 0; i < allTokens.length; i += 500) {
          tokenChunks.push(allTokens.slice(i, i + 500));
        }

        for (const chunk of tokenChunks) {
          try {
            const multicastMsg: MulticastMessage = {
              tokens: chunk,
              notification,
              data: dataPayload,
              android: {
                notification: {
                  channelId: "daivik_broadcasts",
                  priority: "high",
                  defaultSound: true,
                  defaultVibrateTimings: true,
                  icon: "@mipmap/ic_launcher",
                  clickAction: "FLUTTER_NOTIFICATION_CLICK",
                },
                priority: "high",
              },
              apns: {
                payload: {
                  aps: { alert: { title, body: message }, sound: "default", badge: 1 },
                },
              },
            };

            const batchResponse = await messaging.sendEachForMulticast(multicastMsg);
            fcmResult.sent += batchResponse.successCount;
            fcmResult.failed += batchResponse.failureCount;

            // Mark failed tokens as inactive
            const failedTokens: string[] = [];
            batchResponse.responses.forEach((resp: { success: boolean; error?: { code?: string } }, idx: number) => {
              if (!resp.success) {
                const code = resp.error?.code;
                if (
                  code === "messaging/invalid-registration-token" ||
                  code === "messaging/registration-token-not-registered"
                ) {
                  failedTokens.push(chunk[idx]);
                }
              }
            });

            if (failedTokens.length > 0) {
              await db
                .from("device_tokens")
                .update({ is_active: false })
                .in("fcm_token", failedTokens);
            }
          } catch (chunkErr) {
            console.error("[broadcast POST] FCM chunk error:", chunkErr);
            fcmResult.failed += chunk.length;
            fcmResult.error = chunkErr instanceof Error ? chunkErr.message : "FCM error";
          }
        }

        console.log(`[broadcast POST] FCM sent: ${fcmResult.sent}, failed: ${fcmResult.failed}`);

        // Update sent_count in campaign record
        await db
          .from("notification_campaigns")
          .update({ sent_count: fcmResult.sent })
          .eq("id", campaign.id);
      } else {
        fcmResult.error = "No device tokens registered yet";
        console.log("[broadcast POST] No device tokens found");
      }
    } catch (fcmErr) {
      fcmResult.error = fcmErr instanceof Error ? fcmErr.message : "FCM initialization error";
      console.error("[broadcast POST] FCM error:", fcmErr);
    }

    return NextResponse.json({ success: true, data: campaign, fcm: fcmResult });
  } catch (err) {
    console.error("[broadcast POST] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// DELETE — Remove a notification campaign by ID
// ────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    const { error } = await supabase()
      .from("notification_campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
