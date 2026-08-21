// src/presentation/components/StreamStatCard.tsx
// Kartu per-CCTV yang menampilkan statistik real-time + live feed thumbnail
"use client";

import { useTrafficData } from "@/application/use-cases/useTrafficData";
import type { Stream } from "@/domain/entities/TrafficMetric";
import {
  Car,
  Bike,
  Truck,
  Bus,
  Video,
  Wifi,
  WifiOff,
  AlertTriangle,
  Maximize2,
  Activity,
} from "lucide-react";
import { useMemo } from "react";

interface StreamStatCardProps {
  stream: Stream;
  onExpand: (streamId: string) => void;
}

// Mapping status kepadatan ke warna
const densityConfig: Record<
  string,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  "Low Density": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    label: "Low",
  },
  "Medium Density": {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    dot: "bg-yellow-400",
    label: "Medium",
  },
  "High Density": {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-400",
    label: "High",
  },
  Anomaly: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-400",
    label: "Anomaly",
  },
};

const defaultDensity = {
  bg: "bg-white/5",
  text: "text-text-muted",
  border: "border-white/10",
  dot: "bg-text-muted",
  label: "—",
};

function VehicleStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={13} style={{ color }} />
      </div>
      <span className="text-[13px] font-bold text-text-primary leading-none">
        {value}
      </span>
      <span className="text-[9px] text-text-muted uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export function StreamStatCard({ stream, onExpand }: StreamStatCardProps) {
  // Tiap kartu memanggil hook sendiri — WS paralel
  const { data, frameBase64, isLoading, error } = useTrafficData(
    stream.status === "active" ? stream.id : null
  );

  const extendedData = data as
    | (typeof data & {
        totalVehicle?: number;
        densityStatus?: string;
        averageSpeed?: number;
        roadOccupancy?: number;
        congestionIndex?: number;
      })
    | null;

  const densityStatus = extendedData?.densityStatus ?? "";
  const density = densityConfig[densityStatus] ?? defaultDensity;

  const counts = useMemo(() => {
    if (!data) return { car: 0, motorcycle: 0, truck: 0, bus: 0 };
    const metrics = data.metrics;
    return {
      car: Number(metrics.find((m) => m.label === "Mobil")?.value ?? 0),
      motorcycle: Number(metrics.find((m) => m.label === "Motor")?.value ?? 0),
      truck: Number(metrics.find((m) => m.label === "Truk")?.value ?? 0),
      bus: Number(metrics.find((m) => m.label === "Bus")?.value ?? 0),
    };
  }, [data]);

  const totalVehicles = extendedData?.totalVehicle ?? 0;

  const isOffline = stream.status !== "active";
  const isConnecting = !isOffline && isLoading && !data;
  const isLive = !isLoading && !error && !!data;

  return (
    <div
      className={`
        group relative flex flex-col bg-surface-1 border rounded-2xl overflow-hidden
        transition-all duration-300 hover:border-accent-primary/30 hover:shadow-lg hover:shadow-accent-primary/5
        ${
          isLive && densityStatus === "High Density"
            ? "border-red-500/30 shadow-sm shadow-red-500/10"
            : isLive && densityStatus === "Anomaly"
            ? "border-purple-500/30 shadow-sm shadow-purple-500/10"
            : "border-border-default"
        }
      `}
    >
      {/* ── Thumbnail / Live Feed Preview ── */}
      <div className="relative h-40 bg-surface-2 overflow-hidden">
        {frameBase64 ? (
          <img
            src={frameBase64}
            alt={`Live feed ${stream.location_name}`}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-text-muted">
              {isOffline ? (
                <>
                  <WifiOff size={22} strokeWidth={1.5} />
                  <span className="text-xs font-medium">Offline</span>
                </>
              ) : isConnecting ? (
                <>
                  <Activity
                    size={22}
                    strokeWidth={1.5}
                    className="animate-pulse text-accent-primary"
                  />
                  <span className="text-xs font-medium text-accent-primary">
                    Connecting…
                  </span>
                </>
              ) : (
                <>
                  <Video size={22} strokeWidth={1.5} />
                  <span className="text-xs">No Feed</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                Live
              </span>
            </div>
          </div>
        )}

        {/* Density badge */}
        {isLive && densityStatus && (
          <div className="absolute top-2 right-2">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${density.bg} ${density.text} ${density.border}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${density.dot} ${
                  ["High Density", "Anomaly"].includes(densityStatus)
                    ? "animate-pulse"
                    : ""
                }`}
              />
              {density.label}
            </div>
          </div>
        )}

        {/* Expand button */}
        {stream.status === "active" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand(stream.id);
            }}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all"
            title="Lihat detail penuh"
          >
            <Maximize2 size={12} />
          </button>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-surface-1 to-transparent" />
      </div>

      {/* ── Info & Stats ── */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Location name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="text-sm font-semibold text-text-primary leading-tight truncate"
              title={stream.location_name}
            >
              {stream.location_name}
            </h3>
            <span className="text-[10px] text-text-muted capitalize font-medium">
              {stream.stream_type}
            </span>
          </div>

          {/* Connection status icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isLive ? (
              <Wifi size={13} className="text-emerald-400" />
            ) : isOffline ? (
              <WifiOff size={13} className="text-text-muted" />
            ) : (
              <Wifi size={13} className="text-text-muted animate-pulse" />
            )}
          </div>
        </div>

        {/* Vehicle counts */}
        {isLive ? (
          <>
            {/* Total vehicle highlight */}
            <div className="flex items-center justify-between bg-surface-2 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Total Kendaraan
              </span>
              <span className="text-base font-bold text-text-primary">
                {totalVehicles}
              </span>
            </div>

            {/* Per-vehicle breakdown */}
            <div className="grid grid-cols-4 gap-1">
              <VehicleStat
                icon={Car}
                label="Mobil"
                value={counts.car}
                color="#E879F9"
              />
              <VehicleStat
                icon={Bike}
                label="Motor"
                value={counts.motorcycle}
                color="#A78BFA"
              />
              <VehicleStat
                icon={Truck}
                label="Truk"
                value={counts.truck}
                color="#60A5FA"
              />
              <VehicleStat
                icon={Bus}
                label="Bus"
                value={counts.bus}
                color="#34D399"
              />
            </div>


          </>
        ) : isOffline ? (
          <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2.5">
            <WifiOff size={13} className="text-text-muted" />
            <span className="text-xs text-text-muted">Stream offline</span>
          </div>
        ) : (
          /* Skeleton loading */
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="h-8 bg-surface-2 rounded-xl" />
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-surface-2 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
            <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
            <span className="text-[11px] text-red-400 line-clamp-2">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
