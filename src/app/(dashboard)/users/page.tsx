"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, UserCheck, Sparkles, Smartphone, Mail, Globe, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  user_id: number;
  display_name: string;
  email: string | null;
  phone_number: string | null;
  login_method: string;
  is_anonymous: boolean;
  is_premium: boolean;
  status: string;
  created_at: string;
  last_active_at: string;
}

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        let q = supabase.from("profiles").select("*");

        if (statusFilter !== "all") {
          q = q.eq("status", statusFilter);
        }

        const { data, error } = await q.order("user_id", { ascending: true });

        if (data && !error) {
          setUsers(data as UserProfile[]);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, [statusFilter, supabase]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.user_id.toString().includes(q) ||
      u.display_name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone_number && u.phone_number.includes(q)) ||
      u.login_method.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Registered Devotees
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage authenticated users, Guest anonymous sessions, Bhagwa User IDs, and activity logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["all", "active", "inactive", "banned"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? "bg-[#FF7A00] text-white shadow-xs"
                  : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Search by Bhagwa User ID (e.g. 101), Name, Email, Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/50"
        />
      </div>

      {/* Users Data Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="py-3.5 px-4">Bhagwa User ID</th>
                <th className="py-3.5 px-4">Devotee Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Login Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-secondary)]">
                    Loading devotees list from database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <div className="space-y-2">
                      <Users className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-40" />
                      <p className="text-sm font-semibold text-[var(--text-primary)]">No Registered Devotees Found</p>
                      <p className="text-xs">App signups will appear here with assigned Bhagwa User IDs.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#FF7A00]">
                      #{u.user_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <span>{u.display_name}</span>
                        {u.is_premium && (
                          <span className="text-amber-500" title="Premium Subscriber">
                            <Sparkles className="w-3.5 h-3.5 fill-current inline" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)]">
                      {u.email ? (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{u.email}</span>
                        </div>
                      ) : u.phone_number ? (
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{u.phone_number}</span>
                        </div>
                      ) : (
                        <span className="italic">Anonymous Session</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 capitalize">
                        <Globe className="w-3 h-3" />
                        {u.login_method}
                        {u.is_anonymous && " (Guest)"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)]">
                      {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/users/${u.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF7A00]/10 text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white transition-all inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
