"use client";
// src/app/auth/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/infrastructure/services/authService";
import { Radar, Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!isLogin && fullName.trim().length === 0) {
      setError("Full name is required.");
      return;
    }
    if (!isLogin && fullName.trim().length > 100) {
      setError("Full name must be at most 100 characters.");
      return;
    }
    if (!isLogin && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await authService.signIn(email, password);
        router.push("/");
      } else {
        await authService.signUp(email, password, fullName);
        setSuccess(
          "Account created! Check your email to confirm, then sign in."
        );
        setIsLogin(true);
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base bg-grid-subtle relative overflow-hidden p-4">
      {/* Glow highlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-64 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(62,207,142,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-[#171717] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-3.5 shadow-[0_0_20px_rgba(62,207,142,0.15)]">
              <Radar size={24} className="text-accent" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Urban Density Monitor
            </h1>
            <p className="text-xs text-secondary mt-1">
              {isLogin ? "Sign in to access your dashboard" : "Create a new monitoring account"}
            </p>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-status-danger/10 border border-status-danger/20 text-status-danger p-3 rounded-lg text-xs animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-status-danger flex-shrink-0 mt-1" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                  />
                  <input
                    id="auth-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    maxLength={100}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3.5 py-2 text-sm text-white placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3.5 py-2 text-sm text-white placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "••••••••" : "Min. 8 characters"}
                  minLength={isLogin ? 6 : 8}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-10 py-2 text-sm text-white placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 mt-2 shadow-sm hover:shadow-[0_0_12px_rgba(62,207,142,0.25)] text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Please wait…</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-xs text-secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-accent hover:text-accent-hover font-semibold transition-colors ml-1"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
