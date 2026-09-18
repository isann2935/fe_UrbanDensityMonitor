// src/app/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";

// Application layer
import { useTrafficData } from "@/application/use-cases/useTrafficData";
import { streamService } from "@/infrastructure/services/streamService";
import type { Stream } from "@/domain/entities/TrafficMetric";

// Presentation layer — UI components
import { MapBackground } from "@/presentation/components/MapBackground";
import { Sidebar } from "@/presentation/components/Sidebar";
import { Header } from "@/presentation/components/Header";
import { StatsPanel } from "@/presentation/components/StatsPanel";
import { AlertPanel } from "@/presentation/components/AlertPanel";
import { LoadingOverlay } from "@/presentation/components/LoadingOverlay";
import { StreamStatCard } from "@/presentation/components/StreamStatCard";

import {
  Video,
  Wifi,
  Zap,
  Clock,
  Search,
  X,
  ArrowLeft,
  LayoutGrid,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function Page() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isStreamsLoading, setIsStreamsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    streamService
      .getStreams()
      .then((data) => {
        setStreams(data);
      })
      .catch((err) => console.error("Failed to load streams:", err))
      .finally(() => setIsStreamsLoading(false));
  }, []);

  // Filter streams by search query
  const filteredStreams = useMemo(() => {
    if (!searchQuery.trim()) return streams;
    const q = searchQuery.toLowerCase().trim();
    return streams.filter(
      (s) =>
        s.location_name.toLowerCase().includes(q) ||
        s.stream_type.toLowerCase().includes(q)
    );
  }, [streams, searchQuery]);

  // Hook untuk detail view satu stream yang di-expand
  const { data, frameBase64, isLoading, error, refetch, lastFetchedAt } =
    useTrafficData(activeStreamId);

  const totalVehicles = useMemo(() => {
    if (!data) return 0;
    return data.metrics
      .filter((m) => m.category === "vehicle")
      .reduce((sum, m) => sum + (typeof m.value === "number" ? m.value : 0), 0);
  }, [data]);

  const selectedStream = streams.find((s) => s.id === activeStreamId);

  const activeStreams = streams.filter((s) => s.status === "active");
  const inactiveStreams = streams.filter((s) => s.status !== "active");

  return (
    <div className="flex min-h-screen bg-base bg-grid-subtle">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <Header
          locationName={
            selectedStream?.location_name ?? data?.locationName ?? "Dashboard Overview"
          }
          coordinates={data?.coordinates ?? { lat: -6.2088, lng: 106.8456 }}
          activeCamera={data?.activeCamera ?? (activeStreamId ? 1 : 0)}
          totalCameras={
            streams.filter((s) => s.status === "active").length ||
            data?.totalCameras ||
            0
          }
          isLoading={isLoading || isStreamsLoading}
          onRefetch={refetch}
          lastFetchedAt={lastFetchedAt}
          streams={streams}
          selectedStreamId={activeStreamId}
          onStreamChange={(id) => setActiveStreamId(id || null)}
        />

        {/* Loading state while fetching stream list */}
        {isStreamsLoading && <LoadingOverlay />}

        {/* Loading state saat masuk ke detail view */}
        {!isStreamsLoading && isLoading && !data && activeStreamId && (
          <LoadingOverlay
            onCancel={() => setActiveStreamId(null)}
          />
        )}

        {/* Error fallback */}
        {error && !data && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-status-danger/10 border border-status-danger/20 rounded-2xl p-6 text-center max-w-sm animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-status-danger/10 flex items-center justify-center mx-auto mb-3">
                <Zap size={20} className="text-status-danger" />
              </div>
              <p className="text-status-danger font-semibold mb-2">Connection Error</p>
              <p className="text-sm text-secondary mb-4">{error}</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setActiveStreamId(null)}
                  className="px-4 py-2 bg-card border border-white/[0.08] rounded-lg text-sm font-medium text-white hover:bg-card/60 transition-all"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  onClick={refetch}
                  className="px-5 py-2.5 bg-accent/15 border border-accent/30 rounded-lg text-sm font-medium text-accent hover:bg-accent/25 transition-all"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            DETAIL VIEW — Satu stream di-expand (klik Expand di kartu)
        ════════════════════════════════════════════════════════════ */}
        {!isStreamsLoading && activeStreamId && data && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Left column — Live Feed */}
              <div className="lg:col-span-2">
                {/* Back button */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setActiveStreamId(null)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card hover:bg-card/60 border border-white/[0.08] hover:border-accent/30 text-xs font-semibold text-secondary hover:text-accent transition-all duration-200 shadow-sm group"
                  >
                    <ArrowLeft
                      size={14}
                      className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    <span>Kembali ke Dashboard</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-medium">
                      {selectedStream?.location_name}
                    </span>
                  </div>
                </div>

                <div className="h-[420px]">
                  <MapBackground frameBase64={frameBase64} />
                </div>
              </div>

              {/* Right column — Stats + Alerts */}
              <div className="space-y-4">
                <StatsPanel metrics={data.metrics} totalVehicles={totalVehicles} />
                <AlertPanel alerts={data.alerts} maxHeight="max-h-[260px]" />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            DASHBOARD UTAMA — Grid semua CCTV dengan statistik paralel
        ════════════════════════════════════════════════════════════ */}
        {!isStreamsLoading && !activeStreamId && (
          <div className="flex-1 p-6 overflow-y-auto animate-fade-in">

            {/* ── Header & Search ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                    <LayoutGrid size={13} className="text-accent" />
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Live Dashboard
                  </h1>
                </div>
                <p className="text-sm text-secondary">
                  Semua CCTV berjalan secara real-time dan paralel
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari jalan / nama CCTV..."
                  className="w-full bg-card border border-white/[0.08] rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Stat Summary Strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: "Total CCTV",
                  value: streams.length,
                  icon: Video,
                  color: "text-white",
                  iconColor: "text-accent",
                  iconBg: "bg-accent/15",
                },
                {
                  label: "Active",
                  value: activeStreams.length,
                  icon: Wifi,
                  color: "text-emerald-400",
                  iconColor: "text-emerald-400",
                  iconBg: "bg-emerald-500/10",
                },
                {
                  label: "Offline",
                  value: inactiveStreams.length,
                  icon: Activity,
                  color: "text-secondary",
                  iconColor: "text-secondary",
                  iconBg: "bg-white/5",
                },
                {
                  label: "Hasil Pencarian",
                  value: filteredStreams.length,
                  icon: Search,
                  color: "text-white",
                  iconColor: "text-secondary",
                  iconBg: "bg-white/5",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-white/[0.08] rounded-2xl px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}
                  >
                    <stat.icon size={14} className={stat.iconColor} />
                  </div>
                  <div>
                    <p className="text-[10px] text-secondary uppercase tracking-wider font-semibold">
                      {stat.label}
                    </p>
                    <p className={`text-lg font-bold leading-tight ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Grid Kartu CCTV (semua paralel) ── */}
            {filteredStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStreams.map((stream) => (
                  <StreamStatCard
                    key={stream.id}
                    stream={stream}
                    onExpand={(id) => setActiveStreamId(id)}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center p-16 bg-card rounded-2xl border border-white/[0.08]">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-secondary" strokeWidth={1.5} />
                </div>
                <p className="text-white font-medium">
                  {streams.length === 0
                    ? "Belum ada CCTV yang ditambahkan"
                    : "CCTV tidak ditemukan"}
                </p>
                <p className="text-sm text-secondary mt-1">
                  {streams.length === 0
                    ? "Tambahkan stream CCTV melalui menu Stream Management"
                    : `Tidak ada yang cocok dengan "${searchQuery}"`}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 bg-card border border-white/[0.08] rounded-lg text-xs font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    Tampilkan Semua CCTV
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
