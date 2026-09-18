// src/presentation/components/AlertPanel.tsx
"use client";

import { AlertTriangle, Bell, CheckCircle2, Clock, Inbox } from "lucide-react";
import type { AlertStatus } from "@/domain/entities/TrafficMetric";

interface AlertPanelProps {
  alerts: AlertStatus[];
  maxHeight?: string;
}

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

const severityConfig = {
  critical: { dot: "bg-status-danger", text: "text-status-danger", bg: "bg-status-danger/8", ring: "ring-status-danger/20" },
  high: { dot: "bg-orange-500", text: "text-orange-400", bg: "bg-orange-500/8", ring: "ring-orange-500/20" },
  medium: { dot: "bg-status-warning", text: "text-status-warning", bg: "bg-status-warning/8", ring: "ring-status-warning/20" },
  low: { dot: "bg-status-info", text: "text-status-info", bg: "bg-status-info/8", ring: "ring-status-info/20" },
};

export function AlertPanel({ alerts, maxHeight = "max-h-[280px]" }: AlertPanelProps) {
  const activeAlerts = alerts.filter((a) => a.isActive);

  return (
    <div className="bg-card border border-white/[0.08] rounded-2xl p-5 flex flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Bell size={15} className="text-accent" />
          </div>
          <h2 className="text-sm font-semibold text-white">Active Alerts</h2>
        </div>
        <span className="px-2.5 py-0.5 rounded-lg bg-status-danger/10 border border-status-danger/20 text-xs font-bold text-status-danger font-mono">
          {activeAlerts.length}
        </span>
      </div>

      {/* Alert list with internal scrolling */}
      <div className={`flex flex-col gap-2 overflow-y-auto pr-1.5 ${maxHeight}`}>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-secondary/60">
            <Inbox size={24} className="mb-1.5 opacity-40" />
            <p className="text-xs font-medium">Tidak ada alert aktif</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = severityConfig[alert.severity] ?? severityConfig.medium;
            return (
              <div
                key={alert.id}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border transition-all duration-200
                  ${alert.isActive
                    ? `${cfg.bg} border-white/[0.08] ring-1 ${cfg.ring}`
                    : "bg-black/20 border-white/[0.04] opacity-50"
                  }
                `}
              >
                {/* Severity dot */}
                <div className="mt-0.5 flex-shrink-0">
                  {alert.isActive ? (
                    <span className={`block w-2 h-2 rounded-full ${cfg.dot} animate-pulse-dot`} />
                  ) : (
                    <CheckCircle2 size={14} className="text-secondary" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium leading-snug ${
                      alert.isActive ? cfg.text : "text-secondary"
                    }`}
                  >
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {alert.locationZone && (
                      <span className="text-[10px] text-secondary/70 truncate max-w-[140px] font-mono">
                        {alert.locationZone}
                      </span>
                    )}
                    <span className="text-secondary/30">·</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-secondary">
                      <Clock size={10} />
                      {timeAgo(alert.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Alert type icon */}
                {alert.isActive && (
                  <AlertTriangle size={13} className={`${cfg.text} flex-shrink-0 mt-0.5`} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
