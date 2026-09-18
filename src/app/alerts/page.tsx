"use client";
// src/app/alerts/page.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { PageLayout } from "@/presentation/components/PageLayout";
import { alertService } from "@/infrastructure/services/alertService";
import { streamService } from "@/infrastructure/services/streamService";
import type { AlertRecord, Stream } from "@/domain/entities/TrafficMetric";
import { CustomSelect } from "@/presentation/ui/CustomSelect";
import type { DropdownOption } from "@/presentation/ui/CustomSelect";
import { ALERT_TYPE_BADGE } from "@/shared/constants/densityStatus";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Loader2,
  BellOff,
  Check,
} from "lucide-react";

// Local alias for shared constant
const alertTypeBadge = ALERT_TYPE_BADGE;


function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
}

const PAGE_SIZE = 20;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Filters
  const [streams, setStreams] = useState<Stream[]>([]);
  const [filterStreamId, setFilterStreamId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterRead, setFilterRead] = useState<string>(""); // "" | "false" | "true"

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAlerts = useCallback(
    async (resetOffset = false) => {
      const newOffset = resetOffset ? 0 : offset;
      if (resetOffset) setOffset(0);

      setIsLoading(true);
      setError(null);
      try {
        const params: Parameters<typeof alertService.getAlerts>[0] = {
          limit: PAGE_SIZE,
          offset: newOffset,
        };
        if (filterStreamId) params.stream_id = filterStreamId;
        if (filterRead !== "") params.is_read = filterRead === "true";

        const res = await alertService.getAlerts(params);
        let data = res.data;
        if (filterType) {
          data = data.filter((a) => a.alert_type === filterType);
        }
        setAlerts(data);
        setTotal(res.total);
      } catch (err: any) {
        setError(err.message || "Failed to load alerts.");
      } finally {
        setIsLoading(false);
      }
    },
    [filterStreamId, filterType, filterRead, offset]
  );

  // Load streams for filter
  useEffect(() => {
    streamService.getStreams().then(setStreams).catch(() => {});
  }, []);

  // Initial load + polling every 30s
  useEffect(() => {
    fetchAlerts(true);
    pollingRef.current = setInterval(() => fetchAlerts(true), 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [filterStreamId, filterType, filterRead, fetchAlerts]);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await alertService.markAsRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
    } catch {
      /* ignore */
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  // Options for Dropdowns
  const typeOptions: DropdownOption[] = [
    { value: "", label: "All Types", dotColor: "bg-white/40" },
    { value: "High Density", label: "High Density", dotColor: "bg-status-danger" },
    { value: "Human Anomaly", label: "Human Anomaly", dotColor: "bg-status-warning" },
  ];

  const streamOptions: DropdownOption[] = [
    { value: "", label: "All Streams", dotColor: "bg-white/40" },
    ...streams.map((s) => ({
      value: s.id,
      label: s.location_name,
      dotColor: s.status === "active" ? "bg-status-success" : "bg-status-danger",
      badge: s.stream_type,
    })),
  ];

  const readOptions: DropdownOption[] = [
    { value: "", label: "All Status", dotColor: "bg-white/40" },
    { value: "false", label: "Unread", dotColor: "bg-status-danger" },
    { value: "true", label: "Read", dotColor: "bg-white/30" },
  ];

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Alert Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-status-danger/15 border border-status-danger/30 text-[11px] font-bold text-status-danger">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-secondary mt-1">
              Real-time anomalies and high traffic density detections. Auto-refreshes every 30s.
            </p>
          </div>
          <button
            onClick={() => fetchAlerts(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-card/80 border border-white/[0.08] rounded-lg text-xs font-medium text-secondary hover:text-white transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters — Custom Dropdowns matching Header style */}
        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-card border border-white/[0.08] rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-medium mr-1">
            <Filter size={13} className="text-accent" />
            <span>Filter:</span>
          </div>

          {/* Alert type dropdown */}
          <CustomSelect
            value={filterType}
            onChange={setFilterType}
            options={typeOptions}
            placeholder="Select Type"
            title="Filter by Type"
            minWidth="w-52"
          />

          {/* Stream dropdown */}
          <CustomSelect
            value={filterStreamId}
            onChange={setFilterStreamId}
            options={streamOptions}
            placeholder="Select Stream"
            title="Filter by Stream Node"
            minWidth="w-64"
          />

          {/* Read status dropdown */}
          <CustomSelect
            value={filterRead}
            onChange={setFilterRead}
            options={readOptions}
            placeholder="Select Status"
            title="Filter by Read Status"
            minWidth="w-48"
          />

          {(filterType || filterStreamId || filterRead) && (
            <button
              onClick={() => {
                setFilterType("");
                setFilterStreamId("");
                setFilterRead("");
              }}
              className="text-xs text-secondary hover:text-accent font-medium transition-colors ml-auto px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-status-danger/10 border border-status-danger/20 text-status-danger p-3 rounded-lg text-xs">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && alerts.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && alerts.length === 0 && !error && (
          <div className="text-center py-16 bg-card border border-white/[0.08] rounded-2xl">
            <BellOff size={32} className="text-secondary/40 mx-auto mb-3" />
            <p className="text-white text-sm font-semibold">No alerts recorded</p>
            <p className="text-xs text-secondary mt-1">
              Alerts will automatically trigger when density thresholds or anomalies are detected.
            </p>
          </div>
        )}

        {/* Alert cards list */}
        {alerts.length > 0 && (
          <div className="space-y-2.5">
            {alerts.map((alert) => {
              const cfg =
                alertTypeBadge[alert.alert_type] ?? alertTypeBadge["High Density"];
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all card-interactive ${
                    alert.is_read
                      ? "bg-card/60 border-white/[0.06] opacity-60"
                      : "bg-card border-white/[0.08]"
                  }`}
                >
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}
                      >
                        {alert.alert_type}
                      </span>
                      {alert.is_read ? (
                        <span className="text-[11px] text-secondary flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          Read
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-white mt-1 leading-snug">
                      {alert.alert_message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-secondary">
                      {alert.stream_location && (
                        <span>{alert.stream_location}</span>
                      )}
                      <span>·</span>
                      <span>{timeAgo(alert.created_at)}</span>
                      <span>·</span>
                      <span className="font-mono text-secondary/70">
                        {new Date(alert.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      disabled={markingId === alert.id}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-xs font-medium text-secondary hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-50"
                      title="Mark as read"
                    >
                      {markingId === alert.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-secondary font-mono">
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of{" "}
              {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOffset((o) => Math.max(0, o - PAGE_SIZE));
                  fetchAlerts();
                }}
                disabled={offset === 0 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-medium text-secondary hover:bg-white/[0.04] hover:text-white transition-all disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setOffset((o) => o + PAGE_SIZE);
                  fetchAlerts();
                }}
                disabled={offset + PAGE_SIZE >= total || isLoading}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-medium text-secondary hover:bg-white/[0.04] hover:text-white transition-all disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
