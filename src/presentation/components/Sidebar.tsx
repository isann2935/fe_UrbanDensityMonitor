// src/presentation/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Video,
  BellRing,
  History,
  BarChart3,
  Users,
  Radar,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { authService } from "@/infrastructure/services/authService";
import { useRouter } from "next/navigation";

interface NavItem {
  id: string;
  href: string;
  icon: LucideIcon;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: "dashboard", href: "/", icon: Home, label: "Dashboard" },
  { id: "streams", href: "/streams", icon: Video, label: "Streams" },
  { id: "alerts", href: "/alerts", icon: BellRing, label: "Alerts" },
  { id: "history", href: "/history", icon: History, label: "History" },
  { id: "analytics", href: "/analytics", icon: BarChart3, label: "Analytics" },
  { id: "admin-users", href: "/admin/users", icon: Users, label: "Users", adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const router = useRouter();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/auth");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-[#111111] border-r border-white/[0.06] flex flex-col">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center transition-all duration-200 group-hover:bg-accent/20">
            <Radar size={18} className="text-accent" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-none tracking-tight">
              Urban Density
            </h1>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-secondary">
          Main Menu
        </p>
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 text-sm font-medium
                ${
                  isActive
                    ? "bg-accent/15 text-accent nav-active-bar"
                    : "text-secondary hover:text-white hover:bg-white/[0.04]"
                }
              `}
              title={item.label}
            >
              <item.icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? "text-accent" : "text-secondary group-hover:text-white"
                }`}
              />
              <span className="flex-1">{item.label}</span>

              {/* Active arrow indicator */}
              {isActive && (
                <ChevronRight size={14} className="text-accent/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section — User + Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <span className="text-xs font-bold text-accent">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user?.email?.split("@")[0] ?? "User"}
            </p>
            <p className="text-[10px] text-secondary capitalize">{role ?? "user"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary hover:text-status-danger hover:bg-red-500/[0.08] transition-all duration-200"
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
