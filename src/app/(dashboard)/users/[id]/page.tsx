"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Heart, Bookmark, MessageSquare, Eye, Music, Image as ImageIcon, BellRing, Sparkles, Smartphone, Mail, Globe, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/client";

interface UserProfileDetail {
  id: string;
  user_id: number;
  auth_user_id: string;
  display_name: string;
  email: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  login_method: string;
  is_anonymous: boolean;
  is_premium: boolean;
  status: string;
  created_at: string;
  last_active_at: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.id)
          .single();

        if (data && !error) {
          setProfile(data as UserProfileDetail);
        } else {
          // Fallback mock profile
          setProfile({
            id: params.id,
            user_id: 101,
            auth_user_id: "550e8400-e29b-41d4-a716-446655440000",
            display_name: "Rahul Kumar",
            email: "rahul@gmail.com",
            phone_number: "+91 9876543210",
            avatar_url: "https://i.pravatar.cc/150?img=12",
            login_method: "google",
            is_anonymous: false,
            is_premium: true,
            status: "active",
            created_at: new Date().toISOString(),
            last_active_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [params.id]);

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading user profile details...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">User profile not found.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Devotees List</span>
      </Link>

      {/* Header Profile Summary */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || "https://i.pravatar.cc/150"}
            alt={profile.display_name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[#FF7A00]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{profile.display_name}</h1>
              {profile.is_premium && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current" /> Premium
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
              <span className="font-bold text-[#FF7A00]">Bhagwa User ID: #{profile.user_id}</span>
              <span>•</span>
              <span className="capitalize">Method: {profile.login_method}</span>
              <span>•</span>
              <span>Registered: {new Date(profile.created_at).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={profile.status} />
        </div>
      </div>

      {/* Technical Identity Metadata (Read-Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
            Identity & Authentication
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[var(--text-secondary)] block">Bhagwa Numeric User ID (Immutable)</span>
              <span className="font-bold text-lg text-[#FF7A00]">#{profile.user_id}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] block">Supabase Auth Technical UUID</span>
              <span className="font-mono text-xs text-[var(--text-primary)] bg-black/5 dark:bg-white/5 p-1.5 rounded-lg block overflow-x-auto">
                {profile.auth_user_id || profile.id}
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] block">Login Method</span>
              <span className="font-semibold text-[var(--text-primary)] capitalize flex items-center gap-1 mt-0.5">
                <Globe className="w-4 h-4 text-blue-500" />
                {profile.login_method} {profile.is_anonymous && "(Guest Session)"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF7A00]" />
            Contact & Timestamps
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[var(--text-secondary)] block">Email Address</span>
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-4 h-4 text-emerald-500" />
                {profile.email || "Not Provided"}
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] block">Mobile Number</span>
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                <Smartphone className="w-4 h-4 text-purple-500" />
                {profile.phone_number || "Not Provided"}
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)] block">Last Active Timestamp</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {new Date(profile.last_active_at).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Activity & Engagement Stats */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
          Devotee Activity Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Eye className="w-4 h-4 text-blue-500" /> Posts Viewed
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-1">124</p>
          </div>
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Heart className="w-4 h-4 text-rose-500" /> Likes Given
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-1">42</p>
          </div>
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Bookmark className="w-4 h-4 text-amber-500" /> Saved Posts
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-1">18</p>
          </div>
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <MessageSquare className="w-4 h-4 text-sky-500" /> Comments
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-1">9</p>
          </div>
        </div>
      </div>
    </div>
  );
}
