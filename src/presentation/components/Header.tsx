// src/presentation/components/Header.tsx
"use client";

import { Radar, MapPin, Wifi, RefreshCw, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import type { Stream } from "@/domain/entities/TrafficMetric";

interface HeaderProps {
  locationName: string;
  coordinates: { lat: number; lng: number };
  activeCamera: number;
  totalCameras: number;
  isLoading: boolean;
  onRefetch: () => void;
  lastFetchedAt: Date | null;
  // Stream selector props
  streams?: Stream[];
  selectedStreamId?: string | null;
  onStreamChange?: (id: string) => void;
}

function formatTime(date: Date | null): string {
  if (!date) return "--:--:--";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function Header({
  locationName,
  coordinates,
  activeCamera,
  totalCameras,
  isLoading,
  onRefetch,
  lastFetchedAt,
  streams = [],
  selectedStreamId,
  onStreamChange,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedStream = streams.find((s) => s.id === selectedStreamId);

  return (
    <header className="sticky top-0 z-40 bg-base/80 backdrop-blur-xl ">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white leading-none">
              {locationName}
            </h2>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-3">
          {/* Stream Selector */}
          {streams.length > 0 && onStreamChange && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card hover:bg-card/80 transition-all duration-200 text-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-white font-medium max-w-[140px] truncate">
                  {selectedStream?.location_name ?? "Select Stream"}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-secondary transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 max-h-72 overflow-y-auto bg-card rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] z-50 animate-scale-in">
                  <div className="p-2 ">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary px-2 py-1">
                      Available Streams
                    </p>
                  </div>
                  <div className="p-1">
                    {streams.map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => {
                          onStreamChange(stream.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all ${
                          stream.id === selectedStreamId
                            ? "bg-accent/15 text-accent"
                            : "text-secondary hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            stream.id === selectedStreamId
                              ? "bg-accent"
                              : stream.status === "active"
                              ? "bg-status-success"
                              : "bg-status-danger"
                          }`}
                        />
                        <span className="truncate font-medium">{stream.location_name}</span>
                        <span className="ml-auto text-secondary capitalize text-[10px]">
                          {stream.stream_type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-px h-7 bg-default" />

        </div>
      </div>
    </header>
  );
}
