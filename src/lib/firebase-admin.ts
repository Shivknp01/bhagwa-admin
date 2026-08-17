import { App, initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging as _getMessaging, Messaging } from "firebase-admin/messaging";
import { readFileSync } from "fs";
import { join } from "path";

// Embedded Firebase Admin Service Account Credentials for bhagwa-prod
const EMBEDDED_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "bhagwa-prod",
  private_key_id: "553267bcbedf541d29ab0d662e6627be99f68a71",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDpvfkvMgm1oCkT\ny9pmS57GWbi4C6gVdCQjxdsFeHstSrWQENgqw3DhlB0EvwPuVT4e9bP0XWPhwFRl\njTpvlnUkCy1TC8uZ/wZ8qi8kbZMYAOzxuxlv9CRxDO34tVhgj5sIL8NJMoTXem07\n7nCpsLMeU7TFvO+i+kgV3ipOQYwmQebGIBVESaa3hOfAstHOpJi2gxLEQTup7LQ8\n9CwXJH0R7gF5KDko5f1QMZHAdpsdTXTB97/3LoQkVNC6NSBPJaUV52TVMtkNdsgV\nON60K4QklfF4BYKmeWGMyeGmrubMyvPwfP/TfHL+gmhUoOUvmT8+1CxLdgR6K5bu\n+MS27GRfAgMBAAECggEAbLkk80L/KTB6au7jg7mg/Po25cTmRjRjqxAZNI46HXMm\nyQBMzHdkRkkyxkZjebTE1HnNXtkh4JwppaLvj4AYtM9OIdbWuabaSZqPmw4s4Xls\nvXQd/Ok/Gia9enY/yYqCvmgZGi8Zg3E65ime1g+PAYhGCcQ8Yz6v0Rwp6YSrwA77\nlsy9slG0HN1iyZlgGpTRtDOilRYHEJyKyusEhkZZ79GjChL49NdICLGDJh+bi3iJ\ndDtNAFlUfMlaL3QEVztAtVUFCOtXVqgaSKrplrQ58s4EAZ25YDUYIKcscLOHeeqm\nK/IHdnTJeSdDNI+2ISf1MITGNcfvOxQ38hOeZiBhAQKBgQD/R+dNNOZZdxqaRSgr\n+f013x7N8FzYHwSG+Sc8GG2jnijOV7CfewK4V5busEXXNZzbwiYTfl8z4jT4uvA4\ngxjdrTTjHAosCUu0zRZgsiZ0lzoQJ1RY5CRJjhYWf9hLlL1xRORI8MNHwGAcuvqd\n8SlrsWZlnRnLbIlB9m1WHItmYQKBgQDqZol/V7cXhHV1Os9CvIcJAmk3jZSKc+8I\n0p2t17ld87k3mc7pmEC/NdycneOxTZr9mVvkVlvriJVsGEa4m4OGZ5ucchwk4x54\nfHXHqQVbi0bLc0bSPMCVV+SxhcSQ9iDs7oJHwuBnfUeUKLlvttgs1ZmoOdBOZF8o\nRmnE/EZCvwKBgGKOihhesggcWaLxzD6eN0oTKDtt7wppfz/09VbYP4wJxctUQ5Zu\n0XAGMPlaCLy7sCGP5U9lXLAVR0o4MgI/atw6wM5lxu+VbysQevE+Fmaw8/PEm2Xu\nPqw/NPvew8z6UeFnLZOTkHElLnYpIhTURJ+VT+kvLARDlQJod3Hld1RBAoGBAK5T\n5izcKqKF8+lk/KJQnklYDrKvTGsQQBWatoSFLSqvye+NJ7LZdkX/I/0i/CVwZzX2\nqb4PcDujECYdg/NmTZJXWgcnYsEYXSAUyG/ex8pGsjc7m89eOYiYntBcgU2ij+hG\nloQSblzpcqPBCfEI1ou5rJbNsJus0IyemalUSlj3AoGAHTeHLS0bjJaiz2+k2kCQ\nyzmAkCIZ/0gku5sJzNSRqau7HT550GdF1yg7V+7JFoJ2SQPR3Kk7o92AJX+dXFIl\nqVVIVEusMLDNtraKaRlZNPbInqWh1/Vtfu03gmBTmIEkF/0exL7Fk5uc3IpVNLST\nyia2qxxrr9B6KnqxugWXyeY=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@bhagwa-prod.iam.gserviceaccount.com",
  client_id: "116210415504023518825",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bhagwa-prod.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

let cachedApp: App | null = null;

export function getFirebaseAdmin(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  let serviceAccountObj: Record<string, string> = EMBEDDED_SERVICE_ACCOUNT;

  // 1. Try reading local file if available
  try {
    const serviceAccountPath = join(process.cwd(), "firebase-service-account.json");
    const raw = readFileSync(serviceAccountPath, "utf8");
    serviceAccountObj = JSON.parse(raw);
  } catch {
    // Use EMBEDDED_SERVICE_ACCOUNT fallback
  }

  cachedApp = initializeApp({
    credential: cert(serviceAccountObj as Parameters<typeof cert>[0]),
  });

  return cachedApp;
}

export function getMessaging(): Messaging {
  const app = getFirebaseAdmin();
  return _getMessaging(app);
}
