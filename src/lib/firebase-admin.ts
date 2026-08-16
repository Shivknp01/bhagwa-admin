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

  // Load service account from file
  const serviceAccountPath = join(process.cwd(), "firebase-service-account.json");
  let serviceAccountJson: Record<string, string>;

  try {
    const raw = readFileSync(serviceAccountPath, "utf8");
    serviceAccountJson = JSON.parse(raw);
  } catch {
    // Fallback to env vars
    serviceAccountJson = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "bhagwa-prod",
      client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
      private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
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
