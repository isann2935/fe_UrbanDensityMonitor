// src/shared/constants/densityStatus.ts
// Centralized density status display configuration.
// Used by history, analytics, alerts, and stream card components.

import type { DensityStatus } from "@/domain/entities/TrafficMetric";

export interface StatusBadgeConfig {
  bg: string;
  text: string;
  border: string;
  dotColor: string;
}

export const DENSITY_BADGE: Record<DensityStatus, StatusBadgeConfig> = {
  "Low Density": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/25",
    dotColor: "bg-emerald-400",
  },
  "Medium Density": {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/25",
    dotColor: "bg-yellow-400",
  },
  "High Density": {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/25",
    dotColor: "bg-red-400",
  },
  Anomaly: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/25",
    dotColor: "bg-purple-400",
  },
};

export const DENSITY_STATUS_OPTIONS: DensityStatus[] = [
  "Low Density",
  "Medium Density",
  "High Density",
  "Anomaly",
];

/** Recharts-compatible color map for chart series */
export const DENSITY_CHART_COLORS: Record<string, string> = {
  "Low Density": "#3ECF8E",
  "Medium Density": "#FBBF24",
  "High Density": "#F87171",
  Anomaly: "#A78BFA",
};

export interface AlertBadgeConfig {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

export const ALERT_TYPE_BADGE: Record<string, AlertBadgeConfig> = {
  "High Density": {
    bg: "bg-status-danger/10",
    text: "text-status-danger",
    border: "border-status-danger/25",
    icon: "",
  },
  "Human Anomaly": {
    bg: "bg-status-warning/10",
    text: "text-status-warning",
    border: "border-status-warning/25",
    icon: "",
  },
};
