"use client";

import React, { useState, useEffect } from "react";
import { Shield, Smartphone, LogIn, Save, CheckCircle, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();

  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [phoneEnabled, setPhoneEnabled] = useState(true);
  const [skipEnabled, setSkipEnabled] = useState(true);

  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from("app_settings").select("setting_key, setting_value");
        if (data && !error) {
          data.forEach((item) => {
            const val = item.setting_value === true || item.setting_value === "true";
            if (item.setting_key === "auth.google_enabled") setGoogleEnabled(val);
            if (item.setting_key === "auth.phone_enabled") setPhoneEnabled(val);
            if (item.setting_key === "auth.skip_enabled") setSkipEnabled(val);
            if (item.setting_key === "comments_enabled") setCommentsEnabled(val);
            if (item.setting_key === "sharing_enabled") setSharingEnabled(val);
            if (item.setting_key === "maintenance_mode") setMaintenanceMode(val);
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updates = [
        { setting_key: "auth.google_enabled", setting_value: JSON.stringify(googleEnabled) },
        { setting_key: "auth.phone_enabled", setting_value: JSON.stringify(phoneEnabled) },
        { setting_key: "auth.skip_enabled", setting_value: JSON.stringify(skipEnabled) },
        { setting_key: "comments_enabled", setting_value: JSON.stringify(commentsEnabled) },
        { setting_key: "sharing_enabled", setting_value: JSON.stringify(sharingEnabled) },
        { setting_key: "maintenance_mode", setting_value: JSON.stringify(maintenanceMode) },
      ];

      for (const update of updates) {
        await supabase.from("app_settings").upsert(update, { onConflict: "setting_key" });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Admin & App Controls
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage dynamic authentication visibility, feature toggles, and mobile app configuration live.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Authentication options & system settings updated successfully!</span>
        </div>
      )}

      {/* 1. AUTHENTICATION OPTIONS CONTROL PANEL */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Authentication Controls
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Control which login options are visible to devotees in the Bhagwa Flutter mobile app.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Switch 1: Google Login */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm">
                G
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Google Login</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Allow users to sign in with Google OAuth account
                </p>
              </div>
            </div>
            <button
              onClick={() => setGoogleEnabled(!googleEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                googleEnabled ? "bg-[#FF7A00]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  googleEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Switch 2: Phone OTP Login */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Phone OTP Login</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Allow users to sign in with 10-digit mobile number + SMS OTP
                </p>
              </div>
            </div>
            <button
              onClick={() => setPhoneEnabled(!phoneEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                phoneEnabled ? "bg-[#FF7A00]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  phoneEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Switch 3: Skip Login / Anonymous Guest */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Skip Login (Guest Mode)</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Allow instant anonymous session access with per-device numeric ID
                </p>
              </div>
            </div>
            <button
              onClick={() => setSkipEnabled(!skipEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                skipEnabled ? "bg-[#FF7A00]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  skipEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FEATURE TOGGLES */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Global App Toggles</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Enable or disable community comments, sharing, and maintenance mode.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]/50">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Comments Section</p>
              <p className="text-xs text-[var(--text-secondary)]">Enable user comment section under posts</p>
            </div>
            <button
              onClick={() => setCommentsEnabled(!commentsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                commentsEnabled ? "bg-[#FF7A00]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  commentsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Social Share Links</p>
              <p className="text-xs text-[var(--text-secondary)]">Enable WhatsApp and native share buttons</p>
            </div>
            <button
              onClick={() => setSharingEnabled(!sharingEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                sharingEnabled ? "bg-[#FF7A00]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sharingEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A00] text-white font-bold text-sm shadow-md hover:bg-[#E66E00] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving Settings..." : "Save Settings"}</span>
        </button>
      </div>
    </div>
  );
}
