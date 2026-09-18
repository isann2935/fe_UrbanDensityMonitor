"use client";
// src/app/streams/page.tsx

import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/presentation/components/PageLayout";
import { streamService } from "@/infrastructure/services/streamService";
import type { Stream } from "@/domain/entities/TrafficMetric";
import {
  Plus,
  Video,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface StreamFormData {
  location_name: string;
  stream_url: string;
  stream_type: "youtube" | "rtsp" | "cctv" | "hls";
}

const defaultForm: StreamFormData = {
  location_name: "",
  stream_url: "",
  stream_type: "cctv",
};

function StreamModal({
  initial,
  onClose,
  onSave,
  loading,
}: {
  initial?: Stream | null;
  onClose: () => void;
  onSave: (data: StreamFormData) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<StreamFormData>(
    initial
      ? {
          location_name: initial.location_name,
          stream_url: initial.stream_url,
          stream_type: initial.stream_type,
        }
      : defaultForm
  );
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (url: string) => {
    const detected = streamService.detectStreamType(url);
    setForm((f) => ({ ...f, stream_url: url, stream_type: detected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.location_name.trim().length === 0) {
      setError("Location name is required.");
      return;
    }
    if (form.location_name.trim().length > 50) {
      setError("Location name must be at most 50 characters.");
      return;
    }
    if (
      !form.stream_url.startsWith("http://") &&
      !form.stream_url.startsWith("https://") &&
      !form.stream_url.startsWith("rtsp://")
    ) {
      setError("URL must start with http://, https://, or rtsp://");
      return;
    }
    try {
      await onSave(form);
    } catch (err: any) {
      setError(err.message || "Failed to save stream.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#171717] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">
            {initial ? "Edit Stream" : "Add Stream Node"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-status-danger/10 border border-status-danger/20 text-status-danger p-3 rounded-lg text-xs">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
              Location Name
            </label>
            <input
              type="text"
              value={form.location_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, location_name: e.target.value }))
              }
              placeholder="e.g. Jalan Sudirman CCTV-01"
              maxLength={50}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
              Stream URL
            </label>
            <input
              type="text"
              value={form.stream_url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/... or rtsp://..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-all font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
              Stream Type
            </label>
            <div className="flex gap-2">
              {(["youtube", "rtsp", "hls", "cctv"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, stream_type: t }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all uppercase font-mono ${
                    form.stream_type === t
                      ? "bg-accent/15 border-accent/40 text-accent font-semibold"
                      : "bg-white/[0.04] border-white/[0.08] text-secondary hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-secondary/60 mt-1.5">
              Auto-detected from URL format.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/[0.08] text-xs font-medium text-secondary hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent hover:bg-accent-hover text-xs font-semibold text-black transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                (initial ? "Save Changes" : "Add Stream Node")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({
  stream,
  onClose,
  onConfirm,
  loading,
}: {
  stream: Stream;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#171717] border border-white/[0.08] rounded-2xl p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-xl bg-status-danger/10 border border-status-danger/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-status-danger" />
        </div>
        <h2 className="text-base font-bold text-white mb-2">
          Delete Stream Node
        </h2>
        <p className="text-xs text-secondary mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="text-white font-semibold">
            {stream.location_name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/[0.08] text-xs font-medium text-secondary hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-status-danger/20 border border-status-danger/40 text-xs font-semibold text-status-danger hover:bg-status-danger/30 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Delete Node"}
          </button>
        </div>
      </div>
    </div>
  );
}

const typeBadge: Record<string, string> = {
  youtube: "bg-red-500/15 text-red-400 border-red-500/30",
  rtsp: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  hls: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  cctv: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export default function StreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteStream, setDeleteStream] = useState<Stream | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStreams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await streamService.getStreams();
      setStreams(data);
    } catch (err: any) {
      setError(err.message || "Failed to load streams.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const handleAdd = async (form: StreamFormData) => {
    setActionLoading(true);
    try {
      await streamService.createStream(form);
      setShowAddModal(false);
      await fetchStreams();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteStream) return;
    setActionLoading(true);
    try {
      await streamService.deleteStream(deleteStream.id);
      setDeleteStream(null);
      await fetchStreams();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageLayout>
      {showAddModal && (
        <StreamModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading}
        />
      )}
      {deleteStream && (
        <DeleteConfirm
          stream={deleteStream}
          onClose={() => setDeleteStream(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <div className="max-w-5xl mx-auto pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Stream Management
            </h1>
            <p className="text-xs text-secondary mt-1">
              Configure and manage active CCTV camera streams and ML vision feeds.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-black font-semibold rounded-lg text-xs transition-all shadow-sm"
          >
            <Plus size={15} />
            <span>Add Stream Node</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Streams", value: streams.length, color: "text-white" },
            {
              label: "Active",
              value: streams.filter((s) => s.status === "active").length,
              color: "text-emerald-400",
            },
            {
              label: "Inactive",
              value: streams.filter((s) => s.status === "inactive").length,
              color: "text-secondary",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#171717] border border-white/[0.08] rounded-xl p-4 card-interactive"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-status-danger/10 border border-status-danger/20 text-status-danger p-3 rounded-lg text-xs">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        )}

        {!isLoading && streams.length === 0 && !error && (
          <div className="text-center py-16 bg-[#171717] border border-white/[0.08] rounded-2xl">
            <Video size={32} className="text-secondary/40 mx-auto mb-3" />
            <p className="text-white text-sm font-semibold">No active stream nodes</p>
            <p className="text-xs text-secondary mt-1">
              Click "Add Stream Node" to register a CCTV or RTSP feed.
            </p>
          </div>
        )}

        {!isLoading && streams.length > 0 && (
          <div className="bg-[#171717] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-black/20">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                      URL
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                      Added
                    </th>
                    <th className="text-right px-5 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {streams.map((stream) => (
                    <tr
                      key={stream.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-white">
                          {stream.location_name}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-semibold uppercase ${
                            typeBadge[stream.stream_type] ??
                            "bg-white/10 text-secondary border-white/10"
                          }`}
                        >
                          {stream.stream_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-secondary font-mono text-[11px] truncate">
                            {stream.stream_url}
                          </span>
                          <a
                            href={stream.stream_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary/50 hover:text-accent flex-shrink-0"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold ${
                            stream.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-white/5 text-secondary border-white/10"
                          }`}
                        >
                          {stream.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-secondary font-mono text-[11px]">
                        {new Date(stream.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setDeleteStream(stream)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary hover:text-status-danger hover:bg-status-danger/10 transition-all"
                            title="Delete stream"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
