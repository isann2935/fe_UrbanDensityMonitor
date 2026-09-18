// src/presentation/components/MetricCard.tsx
"use client";

import {
  Car,
  Bike,
  Truck,
  Bus,
  User,
  BarChart2,
  AlertTriangle,
  Megaphone,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from "lucide-react";
import type { TrafficMetric } from "@/domain/entities/TrafficMetric";

const iconMap: Record<string, LucideIcon> = {
  Car,
  Bike,
  Truck,
  Bus,
  User,
  BarChart2,
  AlertTriangle,
  Megaphone,
};

interface MetricCardProps {
  metric: TrafficMetric;
}

function formatValue(value: number | string): string {
  if (typeof value === "string") return value;
  if (value >= 1000) return value.toLocaleString("id-ID");
  return value.toString();
}

export function MetricCard({ metric }: MetricCardProps) {
  const IconComponent = iconMap[metric.iconName] ?? Car;
  const isAlert = metric.category === "alert" || metric.category === "anomaly";
  const isAnomaly = metric.status === "critical";

  return (
    <div
      className={`
        group relative bg-card rounded-2xl border border-white/[0.08]
        p-4 transition-all duration-300 cursor-default card-interactive card-accent-stripe
        ${isAnomaly ? "ring-1 ring-status-danger/30 border-status-danger/20" : ""}
      `}
    >
      {/* Top row: Icon + Label + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${metric.colorAccent}15` }}
          >
            <IconComponent
              size={16}
              style={{ color: metric.colorAccent }}
              strokeWidth={isAlert ? 2.5 : 2}
            />
          </div>
          <span className="text-xs font-medium text-secondary leading-tight">
            {metric.label}
          </span>
        </div>

        {/* Status badge */}
        {metric.status === "critical" && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-status-danger uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-status-danger animate-pulse" />
            LIVE
          </span>
        )}
        {metric.status === "warning" && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-status-warning uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse-slow" />
            HIGH
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between">
        <div>
          <span
            className={`text-2xl font-bold leading-none tracking-tight ${
              isAnomaly ? "text-status-danger" : "text-white"
            }`}
          >
            {formatValue(metric.value)}
          </span>
          <span className="text-xs text-secondary ml-1.5">{metric.unit}</span>
        </div>

        {/* Trend */}
        {metric.trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${
              metric.trend > 0
                ? "text-status-success bg-status-success/10"
                : metric.trend < 0
                ? "text-status-danger bg-status-danger/10"
                : "text-secondary bg-white/5"
            }`}
          >
            {metric.trend > 0 ? (
              <TrendingUp size={12} />
            ) : metric.trend < 0 ? (
              <TrendingDown size={12} />
            ) : null}
            {Math.abs(metric.trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
