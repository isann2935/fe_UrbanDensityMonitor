// src/app/landing/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radar,
  Video,
  BrainCircuit,
  BarChart3,
  BellRing,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  ChevronDown,
  Activity,
  Eye,
  Server,
  Layers,
  Cpu,
} from "lucide-react";

/* ───────────────────────────── data ───────────────────────────── */

const features = [
  {
    icon: Video,
    title: "Real-time CCTV Streaming",
    desc: "Monitor live feeds from 50+ CCTV cameras across Semarang city with ultra-low latency WebSocket connections.",
    badge: "WebSocket HLS",
  },
  {
    icon: BrainCircuit,
    title: "ML-Powered YOLOv8",
    desc: "Deep learning models detect and classify vehicles, pedestrians, and road anomalies with high accuracy in real-time.",
    badge: "YOLOv8 + CUDA",
  },
  {
    icon: BarChart3,
    title: "Density Clustering & Analytics",
    desc: "Machine learning K-Means clustering classifies road density levels (Low, Medium, High, Anomaly) automatically.",
    badge: "Scikit-Learn ML",
  },
  {
    icon: BellRing,
    title: "Instant Anomaly Alerts",
    desc: "Automated alert pipeline triggers notifications when traffic surges occur or high-density thresholds are breached.",
    badge: "Auto Trigger",
  },
];

const stats = [
  { value: "99.2%", label: "Detection Accuracy", icon: Eye },
  { value: "<25ms", label: "Inference Latency", icon: Zap },
  { value: "50+", label: "CCTV Cameras", icon: Video },
  { value: "24/7", label: "Real-time Telemetry", icon: Activity },
];

const techStack = [
  { name: "YOLOv8", category: "ML Vision", icon: Cpu },
  { name: "FastAPI", category: "Backend Engine", icon: Server },
  { name: "Next.js 14", category: "Frontend Framework", icon: Layers },
  { name: "Supabase", category: "PostgreSQL Database", icon: Shield },
  { name: "WebSocket", category: "Live Telemetry", icon: Activity },
  { name: "Asyncpg", category: "High-Throughput I/O", icon: Zap },
];

/* ───────────────────────────── component ───────────────────────── */

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-base text-white overflow-x-hidden bg-grid-subtle">
      {/* ── Ambient glow accents ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[140px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(62,207,142,0.08) 0%, rgba(62,207,142,0.02) 50%, transparent 80%)",
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />
        <div
          className="absolute bottom-1/3 right-0 w-[500px] h-[500px] blur-[140px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(62,207,142,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ══════════════════════ NAV BAR ══════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 20
            ? "bg-[#0A0A0A]/85 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center shadow-[0_0_15px_rgba(62,207,142,0.2)] group-hover:scale-105 transition-transform">
              <Radar size={16} className="text-accent" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                Urban Density
              </span>
            </div>
          </Link>

          {/* Nav items & CTA */}
          <div className="flex items-center gap-4">
            <a
              href="#features"
              className="text-xs font-medium text-secondary hover:text-white transition-colors hidden sm:block"
            >
              Features
            </a>
            <a
              href="#architecture"
              className="text-xs font-medium text-secondary hover:text-white transition-colors hidden sm:block"
            >
              Architecture
            </a>
            <Link
              href="/auth"
              className="text-xs font-medium text-secondary hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-black text-xs font-semibold shadow-[0_0_20px_rgba(62,207,142,0.25)] transition-all duration-200"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════ HERO SECTION ══════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-24 pb-16 z-10">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            <span className="text-white">Smart Urban Density</span>
            <br />
            <span className="text-accent">Monitoring Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Platform pemantauan lalu lintas dan kepadatan perkotaan secara real-time. Analitik telemetri kendaraan, deteksi anomali, dan peringatan instan dalam satu dashboard terintegrasi.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-black font-semibold text-sm shadow-[0_0_28px_rgba(62,207,142,0.3)] hover:shadow-[0_0_36px_rgba(62,207,142,0.4)] transition-all duration-200 group"
            >
              <span>Buka Live Dashboard</span>
              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card hover:bg-card/80 text-white font-medium text-sm transition-all duration-200"
            >
              <span>Pelajari Fitur</span>
              <ChevronDown size={15} className="text-secondary" />
            </a>
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center gap-1 p-4 rounded-xl bg-card transition-all duration-700 ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${300 + i * 100}ms` }}
              >
                <stat.icon size={15} className="text-accent mb-0.5" />
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {stat.value}
                </span>
                <span className="text-[11px] text-secondary font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section id="features" className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Fitur Lengkap Monitoring AI
            </h2>
            <p className="text-sm text-secondary max-w-lg mx-auto">
              Infrastruktur cerdas untuk memantau pergerakan lalu lintas dan kepadatan kota secara komprehensif.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="group relative p-6 rounded-2xl bg-card transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <feat.icon size={19} />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-accent transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS (ARCHITECTURE) ══════════════════════ */}
      <section id="architecture" className="relative py-20 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Dari Video Stream ke Insight Real-time
            </h2>
            <p className="text-sm text-secondary max-w-lg mx-auto">
              Alur kerja pemrosesan data non-blocking dari kamera CCTV publik hingga dashboard interaktif.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                icon: Video,
                title: "Capture & Stream",
                desc: "Frame video CCTV publik (HLS / m3u8) diakses secara non-blocking menggunakan OpenCV threading.",
              },
              {
                step: "02",
                icon: BrainCircuit,
                title: "YOLOv8 & Clustering",
                desc: "Model YOLOv8 mendeteksi kendaraan & pejalan kaki, kemudian K-Means mengklasifikasikan tingkat kepadatan.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Telemetry & Alerts",
                desc: "Hasil klasifikasi disiarkan via WebSocket ke Next.js Dashboard dan disimpan ke Supabase PostgreSQL.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-card transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <item.icon size={16} />
                  </div>
                  <span className="text-2xl font-bold font-mono text-white/10 group-hover:text-accent/20 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TECH STACK ══════════════════════ */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Modern Full-Stack Architecture
            </h2>
            <p className="text-xs text-secondary">
              Dibangun dengan standar Clean Architecture untuk performa dan keandalan tinggi.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-card transition-all duration-200 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-accent flex-shrink-0">
                  <tech.icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate font-mono">
                    {tech.name}
                  </p>
                  <p className="text-[10px] text-secondary truncate">
                    {tech.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-10 sm:p-12 rounded-2xl bg-card overflow-hidden">
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(62,207,142,0.06) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(62,207,142,0.2)]">
                <Radar size={22} className="text-accent" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                Siap Memulai Monitoring?
              </h2>
              <p className="text-xs sm:text-sm text-secondary mb-7 max-w-md mx-auto leading-relaxed">
                Pantau kondisi lalu lintas perkotaan di berbagai titik strategis secara *real-time* langsung dari peramban Anda.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-black font-semibold text-xs shadow-[0_0_24px_rgba(62,207,142,0.25)] transition-all duration-200"
                >
                  <span>Akses Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/auth"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-xs transition-all duration-200"
                >
                  <span>Masuk / Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="relative py-8 px-6 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center">
              <Radar size={12} className="text-accent" />
            </div>
            <span className="text-xs font-semibold text-secondary">
              Urban Density Monitor · Semarang Smart City
            </span>
          </div>

          <p className="text-[11px] text-secondary/50 font-mono">
            YOLOv8 · FastAPI · Supabase · Next.js App Router
          </p>
        </div>
      </footer>
    </div>
  );
}
