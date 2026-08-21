"use client";

// src/application/use-cases/useTrafficData.ts
// Per-stream hook — aman dipanggil N kali secara paralel untuk N stream berbeda

import { useState, useEffect } from "react";
import type {
  DashboardData,
  TrafficMetric,
  AlertStatus,
} from "@/domain/entities/TrafficMetric";
import {
  trafficWebSocketService,
  FrameUpdateMessage,
} from "@/infrastructure/services/trafficWebSocketService";

export interface UseTrafficDataResult {
  data: DashboardData | null;
  frameBase64: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  lastFetchedAt: Date | null;
}

/** Resolve whichever base64 field the backend sends */
function resolveFrame(msg: FrameUpdateMessage): string | null {
  const raw = msg.frame_base64 ?? msg.frame ?? null;
  if (!raw) return null;
  if (raw.startsWith("data:image")) return raw;
  return `data:image/jpeg;base64,${raw}`;
}

/**
 * Hook per-stream untuk mengonsumsi data WebSocket secara real-time.
 * Bisa dipanggil N kali secara bersamaan dengan streamId berbeda
 * tanpa saling mengganggu (karena service sudah multi-connection).
 */
export function useTrafficData(streamId: string | null): UseTrafficDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [frameBase64, setFrameBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!streamId) {
      setIsLoading(false);
      setData(null);
      setFrameBase64(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Buka koneksi WebSocket untuk stream ini
    // (tidak menutup koneksi stream lain)
    trafficWebSocketService.connect(streamId).catch((err) => {
      setError(err?.message || "Failed to connect to stream");
      setIsLoading(false);
    });

    // Subscribe hanya ke stream ini
    const unsubscribe = trafficWebSocketService.subscribe(
      streamId,
      (msg: FrameUpdateMessage) => {
        setIsLoading(false);

        const frame = resolveFrame(msg);
        setFrameBase64(frame);
        setLastFetchedAt(new Date());

        const { counts } = msg;
        const totalVehicle =
          (counts.motorcycle ?? 0) +
          (counts.car ?? 0) +
          (counts.bus ?? 0) +
          (counts.truck ?? 0);

        const metrics: TrafficMetric[] = [
          {
            id: `${streamId}-metric-car`,
            label: "Mobil",
            value: counts.car ?? 0,
            unit: "vehicles",
            iconName: "Car",
            category: "vehicle",
            status: "normal",
            colorAccent: "#E879F9",
          },
          {
            id: `${streamId}-metric-motor`,
            label: "Motor",
            value: counts.motorcycle ?? 0,
            unit: "vehicles",
            iconName: "Bike",
            category: "vehicle",
            status: "normal",
            colorAccent: "#E879F9",
          },
          {
            id: `${streamId}-metric-truck`,
            label: "Truk",
            value: counts.truck ?? 0,
            unit: "vehicles",
            iconName: "Truck",
            category: "vehicle",
            status: "normal",
            colorAccent: "#A78BFA",
          },
          {
            id: `${streamId}-metric-bus`,
            label: "Bus",
            value: counts.bus ?? 0,
            unit: "vehicles",
            iconName: "Bus",
            category: "vehicle",
            status: "normal",
            colorAccent: "#A78BFA",
          },
          {
            id: `${streamId}-metric-person`,
            label: "Pejalan Kaki",
            value: counts.person ?? 0,
            unit: "people",
            iconName: "User",
            category: "person",
            status: (counts.person ?? 0) > 50 ? "warning" : "normal",
            colorAccent: "#F0ABFC",
          },
          {
            id: `${streamId}-metric-density`,
            label: msg.density_status,
            value: Number(msg.person_vehicle_ratio).toFixed(2),
            unit: "ratio",
            iconName: "BarChart2",
            category: "density",
            status: msg.density_status.includes("High")
              ? "critical"
              : msg.density_status.includes("Anomaly")
              ? "critical"
              : msg.density_status.includes("Medium")
              ? "warning"
              : "normal",
            colorAccent: "#F97316",
          },
        ];

        setData((prev) => {
          let updatedAlerts = prev?.alerts ?? [];

          if (msg.alert && msg.alert.triggered) {
            const isCleared = msg.alert.type === "cleared";
            const newAlert: AlertStatus = {
              id: `alert-${Date.now()}`,
              type: isCleared
                ? "high_density"
                : msg.alert.type.includes("Anomaly")
                ? "anomaly"
                : "high_density",
              message: msg.alert.message,
              severity: isCleared ? "low" : "critical",
              timestamp: new Date().toISOString(),
              isActive: !isCleared,
              locationZone: `Stream ${streamId}`,
            };
            updatedAlerts = [newAlert, ...updatedAlerts].slice(0, 5);
          }

          return {
            metrics,
            alerts: updatedAlerts,
            lastUpdated: new Date().toISOString(),
            activeCamera: 1,
            totalCameras: 1,
            locationName: `Stream ${streamId}`,
            coordinates: { lat: -6.2088, lng: 106.8456 },
            totalVehicle,
            densityStatus: msg.density_status,
            averageSpeed: msg.average_speed ?? 0,
            roadOccupancy: msg.road_occupancy ?? 0,
            congestionIndex: msg.congestion_index ?? 0,
          } as DashboardData & {
            totalVehicle: number;
            densityStatus: string;
            averageSpeed: number;
            roadOccupancy: number;
            congestionIndex: number;
          };
        });
      }
    );

    return () => {
      unsubscribe();
      // Tutup hanya koneksi untuk stream INI, bukan semua stream
      trafficWebSocketService.disconnect(streamId);
    };
  }, [streamId]);

  return {
    data,
    frameBase64,
    isLoading,
    error,
    refetch: () => {
      if (streamId) {
        trafficWebSocketService.disconnect(streamId);
        trafficWebSocketService.connect(streamId);
      }
    },
    lastFetchedAt,
  };
}
