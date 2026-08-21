// src/infrastructure/services/trafficWebSocketService.ts
// Multi-stream WebSocket Manager
// Mendukung N koneksi WebSocket paralel — satu per stream_id

import { authService } from "./authService";

/** Exact payload shape from WS /ws/live/{stream_id} per API docs */
export type FrameUpdateMessage = {
  type: "frame_update";
  stream_id: string;
  counts: {
    person: number;
    motorcycle: number;
    car: number;
    bus: number;
    truck: number;
  };
  person_vehicle_ratio: number;
  density_status: string;
  average_speed?: number;
  road_occupancy?: number;
  congestion_index?: number;
  /** base64 string (with or without data URI prefix) */
  frame_base64?: string;
  /** Alias — backend may send as "frame" too */
  frame?: string;
  alert: {
    triggered: boolean;
    type: string;
    message: string;
  } | null;
};

type MessageHandler = (data: FrameUpdateMessage) => void;

interface StreamConnection {
  ws: WebSocket;
  handlers: Set<MessageHandler>;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  isConnecting: boolean;
}

class TrafficWebSocketService {
  // Map dari stream_id → objek koneksi
  private connections: Map<string, StreamConnection> = new Map();

  /**
   * Buka koneksi WebSocket untuk stream_id tertentu.
   * Jika sudah terbuka (OPEN), tidak akan membuat koneksi baru.
   * Koneksi lama untuk stream lain TIDAK ditutup (multi-stream).
   */
  async connect(streamId: string): Promise<void> {
    const existing = this.connections.get(streamId);
    if (existing?.ws.readyState === WebSocket.OPEN) return;
    if (existing?.isConnecting) return;

    // Buat entry koneksi baru jika belum ada
    if (!this.connections.has(streamId)) {
      this.connections.set(streamId, {
        ws: null as unknown as WebSocket,
        handlers: new Set(),
        reconnectTimer: null,
        isConnecting: false,
      });
    }

    const conn = this.connections.get(streamId)!;
    conn.isConnecting = true;

    try {
      const session = await authService.getSession();
      const token = session?.access_token;

      const wsUrl =
        process.env.NEXT_PUBLIC_WS_API_URL || "ws://localhost:8000";
      const url = token
        ? `${wsUrl}/ws/live/${streamId}?token=${token}`
        : `${wsUrl}/ws/live/${streamId}`;

      const ws = new WebSocket(url);
      conn.ws = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as FrameUpdateMessage;
          if (data.type === "frame_update") {
            const c = this.connections.get(streamId);
            c?.handlers.forEach((h) => h(data));
          }
        } catch (err) {
          console.error(`[WS:${streamId}] Failed to parse message:`, err);
        }
      };

      ws.onopen = () => {
        const c = this.connections.get(streamId);
        if (c) {
          c.isConnecting = false;
          if (c.reconnectTimer) {
            clearTimeout(c.reconnectTimer);
            c.reconnectTimer = null;
          }
        }
        console.log(`[WS:${streamId}] Connected`);
      };

      ws.onclose = (event) => {
        const c = this.connections.get(streamId);
        if (c) c.isConnecting = false;
        console.log(`[WS:${streamId}] Closed (code: ${event.code}) — scheduling reconnect…`);
        this._scheduleReconnect(streamId);
      };

      ws.onerror = (err) => {
        console.error(`[WS:${streamId}] Error:`, err);
        // onclose akan dipanggil setelah onerror
      };
    } catch (err) {
      const c = this.connections.get(streamId);
      if (c) c.isConnecting = false;
      console.error(`[WS:${streamId}] Connection failed:`, err);
      this._scheduleReconnect(streamId);
    }
  }

  private _scheduleReconnect(streamId: string) {
    const conn = this.connections.get(streamId);
    // Jangan reconnect jika stream sudah di-disconnect secara sengaja (entry dihapus)
    if (!conn) return;
    if (conn.reconnectTimer) clearTimeout(conn.reconnectTimer);
    conn.reconnectTimer = setTimeout(() => {
      console.log(`[WS:${streamId}] Reconnecting…`);
      this.connect(streamId);
    }, 5000);
  }

  /**
   * Daftarkan handler untuk menerima data dari stream tertentu.
   * Mengembalikan fungsi unsubscribe.
   */
  subscribe(streamId: string, handler: MessageHandler): () => void {
    // Pastikan entry ada meski connect() belum dipanggil
    if (!this.connections.has(streamId)) {
      this.connections.set(streamId, {
        ws: null as unknown as WebSocket,
        handlers: new Set(),
        reconnectTimer: null,
        isConnecting: false,
      });
    }
    this.connections.get(streamId)!.handlers.add(handler);
    return () => {
      this.connections.get(streamId)?.handlers.delete(handler);
    };
  }

  /**
   * Tutup koneksi WebSocket untuk stream_id tertentu saja.
   * Stream lain TETAP berjalan.
   */
  disconnect(streamId: string) {
    const conn = this.connections.get(streamId);
    if (!conn) return;
    if (conn.reconnectTimer) {
      clearTimeout(conn.reconnectTimer);
      conn.reconnectTimer = null;
    }
    if (conn.ws) {
      conn.ws.onclose = null; // cegah auto-reconnect saat sengaja ditutup
      conn.ws.close();
    }
    this.connections.delete(streamId);
    console.log(`[WS:${streamId}] Disconnected`);
  }

  /**
   * Tutup SEMUA koneksi yang sedang aktif.
   */
  disconnectAll() {
    for (const streamId of Array.from(this.connections.keys())) {
      this.disconnect(streamId);
    }
  }

  /** Cek apakah koneksi untuk stream_id tertentu sedang OPEN */
  isConnected(streamId: string): boolean {
    return this.connections.get(streamId)?.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton — satu instance untuk seluruh aplikasi
export const trafficWebSocketService = new TrafficWebSocketService();
