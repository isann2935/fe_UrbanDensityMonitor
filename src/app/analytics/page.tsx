"use client";
// src/app/analytics/page.tsx

import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/presentation/components/PageLayout";
import { historyService } from "@/infrastructure/services/historyService";
import { streamService } from "@/infrastructure/services/streamService";
import type { HistoryRecord, Stream } from "@/domain/entities/TrafficMetric";
import { CustomSelect } from "@/presentation/ui/CustomSelect";
import type { DropdownOption } from "@/presentation/ui/CustomSelect";
import { DENSITY_CHART_COLORS } from "@/shared/constants/densityStatus";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { BarChart3, Loader2, AlertTriangle, TrendingUp, Car } from "lucide-react";


// Use shared chart colors
const statusColors = DENSITY_CHART_COLORS;



const CHART_STYLE = {
  background: "transparent",
  fontSize: 11,
};

const tooltipStyle = {
  contentStyle: {
    background: "#171717",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    fontSize: 12,
    color: "#FFFFFF",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  labelStyle: { color: "#8B949E" },
};

function KpiCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#171717] border border-white/[0.08] rounded-xl p-5 card-interactive">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-secondary uppercase tracking-wider mt-1">{label}</p>
      {sub && <p className="text-[11px] text-secondary/70 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStreamId, setFilterStreamId] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [streamsData, historyRes] = await Promise.all([
        streamService.getStreams(),
        historyService.getHistory({
          limit: 200,
          offset: 0,
          stream_id: filterStreamId || undefined,
        }),
      ]);
      setStreams(streamsData);
      setHistory(historyRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, [filterStreamId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trend chart: last 100 records
  const trendData = history.slice(0, 100).reverse().map((r, i) => ({
    time: new Date(r.recorded_at).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    idx: i,
    vehicle: r.total_vehicle_count,
  }));

  // Distribution pie
  const distCounts: Record<string, number> = {
    "Low Density": 0,
    "Medium Density": 0,
    "High Density": 0,
    Anomaly: 0,
  };
  history.forEach((r) => {
    if (distCounts[r.density_status] !== undefined)
      distCounts[r.density_status]++;
  });
  const pieData = Object.entries(distCounts).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name],
  }));

  // Vehicle type breakdown
  const vehicleTotals = {
    Mobil: 0,
    Motor: 0,
    Bus: 0,
    Truk: 0,
  };
  history.forEach((r) => {
    vehicleTotals.Mobil += r.car_count;
    vehicleTotals.Motor += r.motorcycle_count;
    vehicleTotals.Bus += r.bus_count;
    vehicleTotals.Truk += r.truck_count;
  });
  const vehiclePieData = Object.entries(vehicleTotals).map(([name, value]) => ({
    name,
    value,
    color: name === "Mobil" ? "#E879F9" : name === "Motor" ? "#A78BFA" : name === "Bus" ? "#34D399" : "#60A5FA",
  }));

  // Bar chart: avg vehicle by hour
  const byHour: Record<number, { vehicle: number; count: number }> = {};
  history.forEach((r) => {
    const h = new Date(r.recorded_at).getHours();
    if (!byHour[h]) byHour[h] = { vehicle: 0, count: 0 };
    byHour[h].vehicle += r.total_vehicle_count;
    byHour[h].count++;
  });
  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    avgVehicle: byHour[h] ? Math.round(byHour[h].vehicle / byHour[h].count) : 0,
  }));

  // KPIs
  const avgVehicle =
    history.length > 0
      ? (history.reduce((s, r) => s + r.total_vehicle_count, 0) / history.length).toFixed(1)
      : "—";
  const highCount = distCounts["High Density"] + distCounts["Anomaly"];
  const anomalyPct =
    history.length > 0
      ? ((highCount / history.length) * 100).toFixed(1)
      : "0";

  const streamOptions: DropdownOption[] = [
    { value: "", label: "All Streams", dotColor: "bg-white/40" },
    ...streams.map((s) => ({
      value: s.id,
      label: s.location_name,
      dotColor: s.status === "active" ? "bg-status-success" : "bg-status-danger",
      badge: s.stream_type,
    })),
  ];

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Analytics & Density Insights
            </h1>
            <p className="text-xs text-secondary mt-1">
              Trend analysis and traffic distribution powered by YOLOv8 vision data.
            </p>
          </div>

          <CustomSelect
            value={filterStreamId}
            onChange={setFilterStreamId}
            options={streamOptions}
            placeholder="Select Stream"
            title="Filter by Stream Node"
            minWidth="w-64"
          />
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
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard
                label="Total Records"
                value={history.length.toLocaleString("id-ID")}
                sub="in selected range"
                icon={<BarChart3 size={16} />}
                color="#3ECF8E"
              />
              <KpiCard
                label="Avg. Vehicle Count"
                value={avgVehicle}
                sub="per processed frame"
                icon={<Car size={16} />}
                color="#60A5FA"
              />
              <KpiCard
                label="High / Anomaly Rate"
                value={`${anomalyPct}%`}
                sub={`${highCount} of ${history.length} records`}
                icon={<TrendingUp size={16} />}
                color="#F87171"
              />
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 bg-card border border-white/[0.08] rounded-2xl">
                <BarChart3 size={32} className="text-secondary/40 mx-auto mb-3" />
                <p className="text-white text-sm font-semibold">No data to visualize</p>
                <p className="text-xs text-secondary mt-1">
                  Start an active CCTV stream to generate density analytics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-card border border-white/[0.08] rounded-2xl p-5 card-interactive">
                  <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-accent" />
                    <span>Vehicle Count Trend (Last 100 Frames)</span>
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trendData} style={CHART_STYLE}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                      />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "#8B949E", fontSize: 10 }}
                        interval={Math.floor(trendData.length / 6)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#8B949E", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, color: "#8B949E" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="vehicle"
                        stroke="#3ECF8E"
                        strokeWidth={2}
                        dot={false}
                        name="Vehicle Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Distribution Pie */}
                <div className="bg-card border border-white/[0.08] rounded-2xl p-5 card-interactive">
                  <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span>Density Cluster Distribution</span>
                  </h2>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(value, name) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2.5">
                      {pieData.map(({ name, value, color }) => (
                        <div key={name} className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ background: color }}
                          />
                          <div>
                            <p className="text-xs font-semibold text-white leading-none">
                              {name}
                            </p>
                            <p className="text-[11px] text-secondary mt-0.5">
                              {value} records
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vehicle Type Distribution */}
                <div className="bg-card border border-white/[0.08] rounded-2xl p-5 card-interactive">
                  <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span>Vehicle Class Breakdown</span>
                  </h2>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={vehiclePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {vehiclePieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(value, name) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2.5">
                      {vehiclePieData.map(({ name, value, color }) => (
                        <div key={name} className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ background: color }}
                          />
                          <div>
                            <p className="text-xs font-semibold text-white leading-none">
                              {name}
                            </p>
                            <p className="text-[11px] text-secondary mt-0.5">
                              {value.toLocaleString("id-ID")} units
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hourly Bar Chart */}
                <div className="lg:col-span-2 bg-card border border-white/[0.08] rounded-2xl p-5 card-interactive">
                  <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={14} className="text-accent" />
                    <span>Average Vehicle Traffic by Hour</span>
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourlyData} style={CHART_STYLE} barSize={10}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: "#8B949E", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        tick={{ fill: "#8B949E", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#8B949E" }} />
                      <Bar
                        dataKey="avgVehicle"
                        fill="#3ECF8E"
                        fillOpacity={0.85}
                        radius={[4, 4, 0, 0]}
                        name="Avg Vehicle"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
