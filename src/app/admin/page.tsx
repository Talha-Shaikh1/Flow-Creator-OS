'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminAccessGuard } from '@/components/auth/AdminAccessGuard';
import { ClerkAuthSync } from '@/components/auth/ClerkAuthSync';
import {
  ShieldCheck,
  Users,
  Film,
  Calendar as CalendarIcon,
  Database,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Activity,
  ArrowLeft,
  ExternalLink,
  Lock,
  Layers,
  Search,
  UserCheck,
  ChevronRight,
  Eye,
  Sliders,
  Flame,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { SystemMetrics, SystemUserWithStats } from '@/lib/db/users';

export default function AdminDashboardPage() {
  return (
    <AdminAccessGuard personaName="Flow Creator OS Command Center" isStudioPage={false}>
      <AdminDashboardContent />
    </AdminAccessGuard>
  );
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'batches' | 'personas' | 'system'>('overview');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [users, setUsers] = useState<SystemUserWithStats[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch initial data
  const loadAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, usersRes, batchesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/batches?limit=50'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setMetrics(statsData.metrics);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (batchesRes.ok) {
        const batchesData = await batchesRes.json();
        setBatches(batchesData.batches || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleRole = async (targetUserId: string, currentRole: string) => {
    const newRole = currentRole === 'super_admin' ? 'creator' : 'super_admin';
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, newRole }),
      });
      if (res.ok) {
        setActionMessage(`User role successfully changed to ${newRole}!`);
        setTimeout(() => setActionMessage(null), 4000);
        loadAdminData();
      }
    } catch (e) {
      console.error('Error toggling role:', e);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('⚠️ ATTENTION: Are you sure you want to clean and wipe database records? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch('/api/db/init?reset=true', { method: 'POST' });
      if (res.ok) {
        setActionMessage('Database wiped and re-initialized cleanly!');
        setTimeout(() => setActionMessage(null), 5000);
        loadAdminData();
      }
    } catch (e) {
      console.error('Failed to reset DB:', e);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-[#09090b] text-neutral-100 antialiased pb-24">
      {/* Top Admin Navigation */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: VIP Admin Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-xl blur-[3px] opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative w-9 h-9 rounded-xl bg-neutral-900 border border-amber-500/40 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20">
                  <img
                    src="/logo-emblem.png"
                    alt="Flow Creator OS Admin"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center">
                    <span>FlowCreator</span>
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 font-black text-xs">
                      ADMIN OS
                    </span>
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Super Admin
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 hidden md:block">
                  Master Governance & Infrastructure Command Center
                </p>
              </div>
            </Link>
          </div>

          {/* Center: System Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-neutral-300 font-mono text-[11px]">Neon DB: {metrics?.db_status || 'healthy'}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400 text-[11px]">Next.js 16 Production Ready</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={loadAdminData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition border border-neutral-800"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <Link
              href="/creator-ops"
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition flex items-center gap-1.5 border border-emerald-500/30 shadow-sm"
              title="Open CreatorOps Daily Hub"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>⚡ CreatorOps Hub</span>
            </Link>

            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition flex items-center gap-1.5 border border-neutral-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>General Studio</span>
            </Link>

            <ClerkAuthSync />
          </div>
        </div>
      </header>

      {/* Main Admin Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Action Flash Message */}
        {actionMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Top KPIs Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Registered Users */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Creators Registered</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{metrics?.total_users ?? 0}</span>
              <span className="text-xs text-amber-400 font-medium">({metrics?.total_super_admins ?? 0} Admins)</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">Active creators registered across system</p>
          </div>

          {/* Total Batches Generated */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Batches Produced</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{metrics?.total_batches ?? 0}</span>
              <span className="text-xs text-indigo-400 font-medium">7-Day Packs</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">Multi-episode series and video campaigns</p>
          </div>

          {/* Total Planned Video Clips */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Veo 10s Directives</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {(metrics?.total_batches ?? 0) * 28}
              </span>
              <span className="text-xs text-purple-400 font-medium">Clips</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">Continuous camera movements planned</p>
          </div>

          {/* Adoption / Filming Rate */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Filmed / Adopted ✅</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">{metrics?.adoption_rate ?? 0}%</span>
              <span className="text-xs text-neutral-400">({metrics?.total_adopted_events ?? 0}/{metrics?.total_calendar_events ?? 0})</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">Calendar days completed & adopted</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Overview & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Creators & Roles ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Film className="w-4 h-4 text-indigo-400" />
            <span>Global Batches Feed ({batches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('personas')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'personas'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Lock className="w-4 h-4 text-pink-400" />
            <span>Private Master Personas (2)</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Database & System Controls</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: AI Engine & Pipeline Matrix */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Multi-Model Engine Orchestration
                  </h3>
                  <p className="text-xs text-neutral-400 mb-6">
                    Flow Creator OS coordinates 5 specialized AI pipelines to generate production-ready 10s video prompts.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-neutral-200">Google Flow Veo 2</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        10-second continuous motion directives, camera physics, rack focus, and spatial lock.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-neutral-200">Midjourney v6 Master Frames</span>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Ready</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        --cref character consistency, 9:16 vertical composition, signature moles, realistic skin textures.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-neutral-200">ElevenLabs Foley & Dialogue</span>
                        <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Integrated</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Single speaker voice pacing, natural conversational pauses, ambient room-tone sound cues.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-neutral-200">Gemini 2.5 Flash Scripting</span>
                        <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Connected</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Procedural story continuity, 3-variant concept mind maps, and batch JSON schema validation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Persona Navigation */}
                <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-pink-400" />
                    Your Private Master Personas (Quick Access)
                  </h3>
                  <p className="text-xs text-neutral-400 mb-4">
                    As Super Admin, only you have access to direct batches for these private production personas.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/influencer"
                      className="p-4 rounded-xl bg-neutral-950 border border-pink-500/20 hover:border-pink-500/50 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-pink-300 transition">Elena Studio</div>
                          <div className="text-[11px] text-neutral-400">UK/EU AI Influencer • Locked Mole</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-pink-400 transition" />
                    </Link>

                    <Link
                      href="/pet-comedy"
                      className="p-4 rounded-xl bg-neutral-950 border border-amber-500/20 hover:border-amber-500/50 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                          <Film className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">Pet Comedy Studio</div>
                          <div className="text-[11px] text-neutral-400">Joe (Cat) • Nova (Corgi) • Zara</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Col: Admin Privileges & System Specs */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    Super Admin Rights
                  </h3>
                  <ul className="space-y-3 text-xs text-neutral-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Full access to Elena and Pet Comedy studios.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Inspect any user batch and prompt generation across the system.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Promote or demote creators to admin roles.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Database maintenance & clean reset capabilities.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    Neon Database Architecture
                  </h3>
                  <div className="space-y-2 font-mono text-[11px] text-neutral-400">
                    <div className="flex justify-between py-1 border-b border-neutral-800">
                      <span>Serverless Postgres:</span>
                      <span className="text-neutral-200">v16 (Neon)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800">
                      <span>Multi-User Isolation:</span>
                      <span className="text-emerald-400">WHERE user_id</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800">
                      <span>Auth Engine:</span>
                      <span className="text-neutral-200">Clerk + Guest Claim</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Status:</span>
                      <span className="text-emerald-400">100% Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users & Creators Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search creators by email, name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <span className="text-xs text-neutral-400">
                Showing {filteredUsers.length} of {users.length} registered users
              </span>
            </div>

            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Creator / User</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Batches Produced</th>
                      <th className="px-5 py-3.5">Calendar Events</th>
                      <th className="px-5 py-3.5">Joined Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-neutral-400">
                          No users found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-neutral-800/30 transition">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {u.image_url ? (
                                <img
                                  src={u.image_url}
                                  alt={u.name || 'User'}
                                  className="w-8 h-8 rounded-full border border-neutral-700 object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold">
                                  {(u.name || u.email || 'U')[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-white">{u.name || 'Anonymous Creator'}</div>
                                <div className="text-[11px] text-neutral-400 font-mono">{u.email || u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {u.role === 'super_admin' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <ShieldCheck className="w-3 h-3" />
                                Super Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                                <Users className="w-3 h-3" />
                                Creator
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-mono text-neutral-300 font-bold">
                            {u.total_batches}
                          </td>
                          <td className="px-5 py-4 font-mono text-neutral-300">
                            {u.total_adopted} / {u.total_calendar_events} <span className="text-emerald-400 font-bold">✅</span>
                          </td>
                          <td className="px-5 py-4 text-neutral-400 font-mono text-[11px]">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleToggleRole(u.id, u.role)}
                              className="px-3 py-1 text-[11px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition border border-neutral-700 cursor-pointer"
                              title={u.role === 'super_admin' ? 'Demote to regular creator' : 'Promote to super admin'}
                            >
                              {u.role === 'super_admin' ? 'Demote to Creator' : 'Promote to Admin 👑'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Global Batches Feed */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Global Batch Productions</h3>
                <p className="text-xs text-neutral-400">Inspect every batch generated across all creators on Flow Creator OS.</p>
              </div>
              <span className="text-xs font-mono text-neutral-400">Total: {batches.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.length === 0 ? (
                <div className="col-span-full p-12 text-center rounded-2xl bg-neutral-900/50 border border-neutral-800 text-neutral-400">
                  No batches recorded in the database yet.
                </div>
              ) : (
                batches.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {b.spec?.format || 'Multi-Clip'}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white mb-1">
                        {b.spec?.genres?.join(', ') || 'General Story Batch'}
                      </h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                        Tone: <span className="text-neutral-200">{b.spec?.tone || 'Cinematic'}</span> • Cast: {b.spec?.cast?.length || 1}
                      </p>

                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400">
                        <div className="truncate">Creator: <span className="text-neutral-300 font-mono">{b.user_email || b.user_id}</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBatch(b)}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Batch Spec</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Master Personas Controls */}
        {activeTab === 'personas' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Lock className="w-5 h-5 text-pink-400" />
                Private Master Personas (Super Admin Exclusive)
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                These personas were designed specifically for your private use. Regular users cannot access their studios or generate prompts for them.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Persona 1: Elena */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-pink-500/20 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                        E
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Elena (UK/EU Persona 1)</h4>
                        <span className="text-[10px] text-pink-300 font-mono">/influencer</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked To Admin
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[11px] block font-mono mb-1">Locked Master DNA:</span>
                      <p className="text-neutral-200 text-xs leading-relaxed font-mono">
                        24yo woman, brunette hair, green eyes, natural subtle makeup, signature cheek beauty mole on cheekbone. Gold layered necklace, Shure mic, warm authentic skin.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-neutral-400 text-xs">Format: Podcast Reels (4-Clip)</span>
                      <Link
                        href="/influencer"
                        className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition flex items-center gap-1"
                      >
                        <span>Open Elena Studio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Persona 2: Pet Comedy */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/20 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        P
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Pet Comedy Cast</h4>
                        <span className="text-[10px] text-amber-300 font-mono">/pet-comedy</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked To Admin
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[11px] block font-mono mb-1">Cast Characters:</span>
                      <p className="text-neutral-200 text-xs leading-relaxed font-mono">
                        • Joe (Cat): Grey British Shorthair, deadpan & sarcastic.<br />
                        • Nova (Dog): Cream Corgi, hyper & naive, red bowtie.<br />
                        • Zara (Owner): 26yo millennial pet parent.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-neutral-400 text-xs">Format: Pet Comedy Sitcom</span>
                      <Link
                        href="/pet-comedy"
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center gap-1"
                      >
                        <span>Open Pet Studio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Database & Maintenance */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Infrastructure & Maintenance
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Direct operations for Neon Serverless PostgreSQL and environment configuration.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Neon DB Table Schemas</h4>
                  <ul className="space-y-2 text-xs font-mono text-neutral-400">
                    <li className="flex justify-between py-1 border-b border-neutral-800">
                      <span>system_users</span>
                      <span className="text-neutral-200">Active (user roles & sync)</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-neutral-800">
                      <span>saved_batches</span>
                      <span className="text-neutral-200">Active (isolated by user_id)</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-neutral-800">
                      <span>content_calendar_events</span>
                      <span className="text-neutral-200">Active (schedule & adoption)</span>
                    </li>
                    <li className="flex justify-between py-1">
                      <span>saved_characters</span>
                      <span className="text-neutral-200">Active (character DNA vault)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Danger Zone: Clean Slate Reset</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      Wipes all test batches, calendar schedules, and mock characters from Neon PostgreSQL to launch clean.
                      The first user to log in after this will become the new Super Admin.
                    </p>
                  </div>

                  <button
                    onClick={handleResetDatabase}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Clean Reset Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Batch Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Batch Spec Inspector</h3>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-xs text-neutral-300">
              <pre className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedBatch.spec, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
