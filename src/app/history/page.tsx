"use client";
// src/app/history/page.tsx

import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/presentation/components/PageLayout";
import { historyService } from "@/infrastructure/services/historyService";
import { streamService } from "@/infrastructure/services/streamService";
import type { HistoryRecord, Stream, DensityStatus } from "@/domain/entities/TrafficMetric";
import { CustomSelect } from "@/presentation/ui/CustomSelect";
import type { DropdownOption } from "@/presentation/ui/CustomSelect";
import { DENSITY_BADGE } from "@/shared/constants/densityStatus";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Inbox,
} from "lucide-react";


// Use shared constants
const densityBadge = DENSITY_BADGE;



const PAGE_SIZE = 50;

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [streams, setStreams] = useState<Stream[]>([]);
  const [filterStreamId, setFilterStreamId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchHistory = useCallback(
    async (newOffset = offset) => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Parameters<typeof historyService.getHistory>[0] = {
          limit: PAGE_SIZE,
          offset: newOffset,
        };
        if (filterStreamId) params.stream_id = filterStreamId;
        if (filterStatus) params.density_status = filterStatus;
        if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
        if (dateTo) {
          const d = new Date(dateTo);
          d.setHours(23, 59, 59, 999);
          params.date_to = d.toISOString();
        }

        const res = await historyService.getHistory(params);
        setHistory(res.data);
        setTotal(res.total);
      } catch (err: any) {
        setError(err.message || "Failed to load history.");
      } finally {
        setIsLoading(false);
      }
    },
    [filterStreamId, filterStatus, dateFrom, dateTo, offset]
  );

  useEffect(() => {
    streamService.getStreams().then(setStreams).catch(() => {});
  }, []);

  useEffect(() => {
    setOffset(0);
    fetchHistory(0);
  }, [filterStreamId, filterStatus, dateFrom, dateTo, fetchHistory]);

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchHistory(newOffset);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const streamOptions: DropdownOption[] = [
    { value: "", label: "All Streams", dotColor: "bg-white/40" },
    ...streams.map((s) => ({
      value: s.id,
      label: s.location_name,
      dotColor: s.status === "active" ? "bg-status-success" : "bg-status-danger",
      badge: s.stream_type,
    })),
  ];

  const statusOptions: DropdownOption[] = [
    { value: "", label: "All Status", dotColor: "bg-white/40" },
    { value: "Low Density", label: "Low Density", dotColor: "bg-emerald-400" },
    { value: "Medium Density", label: "Medium Density", dotColor: "bg-yellow-400" },
    { value: "High Density", label: "High Density", dotColor: "bg-red-400" },
    { value: "Anomaly", label: "Anomaly", dotColor: "bg-purple-400" },
  ];

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Monitoring History
          </h1>
          <p className="text-xs text-secondary mt-1">
            Detailed traffic records and telemetry from ML inference streams.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(["Low Density", "Medium Density", "High Density", "Anomaly"] as DensityStatus[]).map(
            (status) => {
              const cfg = densityBadge[status];
              const count = history.filter((h) => h.density_status === status).length;
              return (
                <div
                  key={status}
                  className={`p-4 rounded-xl border bg-card ${cfg.border} card-interactive`}
                >
                  <p className={`text-[10px] font-semibold ${cfg.text} uppercase tracking-wider`}>
                    {status}
                  </p>
                  <p className={`text-2xl font-bold text-white mt-1`}>{count}</p>
                  <p className="text-[10px] text-secondary mt-0.5">on this page</p>
                </div>
              );
            }
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-card border border-white/[0.08] rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-medium mr-1">
            <Filter size={13} className="text-accent" />
            <span>Filter:</span>
          </div>

          <CustomSelect
            value={filterStreamId}
            onChange={setFilterStreamId}
            options={streamOptions}
            placeholder="Select Stream"
            title="Filter by Stream Node"
            minWidth="w-64"
          />

          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            placeholder="Select Status"
            title="Filter by Density Status"
            minWidth="w-52"
          />

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-card hover:bg-card/80 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono shadow-sm transition-all"
            />
            <span className="text-secondary text-xs">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-card hover:bg-card/80 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono shadow-sm transition-all"
            />
          </div>

          {(filterStreamId || filterStatus || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setFilterStreamId("");
                setFilterStatus("");
                setDateFrom("");
                setDateTo("");
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
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && history.length === 0 && !error && (
          <div className="text-center py-16 bg-card border border-white/[0.08] rounded-2xl">
            <Inbox size={32} className="text-secondary/40 mx-auto mb-3" />
            <p className="text-white text-sm font-semibold">No records found</p>
            <p className="text-xs text-secondary mt-1">
              History records will appear once a CCTV stream starts processing.
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && history.length > 0 && (
          <div className="bg-card border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-black/20">
                    {[
                      "Timestamp",
                      "Person",
                      "Motorcycle",
                      "Car",
                      "Bus",
                      "Truck",
                      "Total Vehicles",
                      "Ratio",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {history.map((record) => {
                    const cfg = densityBadge[record.density_status] ?? densityBadge["Low Density"];
                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-[11px] font-mono text-secondary">
                            {new Date(record.recorded_at).toLocaleString("id-ID")}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-white">
                          {record.person_count}
                        </td>
                        <td className="px-4 py-3 text-center text-secondary">
                          {record.motorcycle_count}
                        </td>
                        <td className="px-4 py-3 text-center text-secondary">
                          {record.car_count}
                        </td>
                        <td className="px-4 py-3 text-center text-secondary">
                          {record.bus_count}
                        </td>
                        <td className="px-4 py-3 text-center text-secondary">
                          {record.truck_count}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-white">
                          {record.total_vehicle_count}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-accent font-semibold">
                          {Number(record.person_vehicle_ratio).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${cfg.bg} ${cfg.border} ${cfg.text} whitespace-nowrap`}
                          >
                            {record.density_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.08]">
              <span className="text-xs text-secondary font-mono">
                Page {currentPage} of {totalPages || 1} · {total} total records
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0 || isLoading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-secondary hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(offset + PAGE_SIZE)}
                  disabled={offset + PAGE_SIZE >= total || isLoading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-secondary hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
