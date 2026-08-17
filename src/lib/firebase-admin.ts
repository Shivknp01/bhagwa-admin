import { App, initializeApp, getApps } from "firebase-admin/app";
import { getMessaging as _getMessaging, Messaging } from "firebase-admin/messaging";
import { cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";

let cachedApp: App | null = null;

export function getFirebaseAdmin(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  let serviceAccountJson: Record<string, string> | null = null;

  // 1. Try FIREBASE_SERVICE_ACCOUNT_BASE64 env var (most reliable for Vercel/cloud)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
      serviceAccountJson = JSON.parse(decoded);
    } catch (e) {
      console.error("[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:", e);
    }
  }

  // 2. Try FIREBASE_SERVICE_ACCOUNT_KEY (raw JSON string env var)
  if (!serviceAccountJson && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      console.error("[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    }
  }

  // 3. Try reading local firebase-service-account.json file
  if (!serviceAccountJson) {
    try {
      const serviceAccountPath = join(process.cwd(), "firebase-service-account.json");
      const raw = readFileSync(serviceAccountPath, "utf8");
      serviceAccountJson = JSON.parse(raw);
    } catch {
      // File not found
    }
  }

  // 4. Fallback to individual env vars
  if (!serviceAccountJson) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
    // Clean up quotes or escaped newlines
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    serviceAccountJson = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "bhagwa-prod",
      client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
      private_key: privateKey,
    };
  }

  cachedApp = initializeApp({
    credential: cert(serviceAccountJson as Parameters<typeof cert>[0]),
  });

  return cachedApp;
}

export function getMessaging(): Messaging {
  const app = getFirebaseAdmin();
  return _getMessaging(app);
}
