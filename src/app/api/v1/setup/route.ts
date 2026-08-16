import { NextResponse } from "next/server";
import { Pool } from "pg";

// Direct Postgres connection to run raw SQL migrations
// Connection uses Supabase's direct connection (port 5432) with postgres user

const MIGRATION_SQL = `
-- Create device_tokens table for FCM push notification delivery
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  fcm_token    TEXT        NOT NULL UNIQUE,
  platform     TEXT        NOT NULL DEFAULT 'android',
  user_id      UUID,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dt_fcm      ON public.device_tokens(fcm_token);
CREATE INDEX IF NOT EXISTS idx_dt_active   ON public.device_tokens(is_active);

-- Enable RLS
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'device_tokens' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.device_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Allow anon/authenticated to insert their token (no user_id required)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'device_tokens' AND policyname = 'allow_insert_token'
  ) THEN
    CREATE POLICY allow_insert_token ON public.device_tokens FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

-- Fix notification_campaigns: Allow anon/authenticated to read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_campaigns' AND policyname = 'public_read_notifications'
  ) THEN
    CREATE POLICY public_read_notifications 
      ON public.notification_campaigns FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

SELECT 'Migration completed' as result;
`;

export async function POST() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  
  if (!dbPassword) {
    return NextResponse.json(
      { 
        error: "SUPABASE_DB_PASSWORD env var not set. Please add it to .env.local",
        hint: "Find your DB password in Supabase Dashboard → Settings → Database → Connection string"
      }, 
      { status: 400 }
    );
  }

  const pool = new Pool({
    host: "aws-0-ap-south-1.pooler.supabase.com",
    port: 5432,
    database: "postgres",
    user: "postgres.fyhtlazvmvsdgsrndoxh",
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    const result = await client.query(MIGRATION_SQL);
    client.release();
    await pool.end();
    return NextResponse.json({ success: true, result: result.rows });
  } catch (err) {
    await pool.end().catch(() => {});
    console.error("[migration] DB error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Migration failed" },
      { status: 500 }
    );
  }
}
