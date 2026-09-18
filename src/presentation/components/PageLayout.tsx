// src/presentation/components/PageLayout.tsx
"use client";

import { Sidebar } from "./Sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  /** Optional right column (e.g. filters panel) */
  aside?: React.ReactNode;
}

export function PageLayout({ children, aside }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-base bg-grid-subtle text-primary flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div className="flex-1 ml-[260px] min-h-screen flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Optional aside */}
      {aside && (
        <aside className="w-80 border-l border-white/[0.08] p-5 bg-[#111111] overflow-y-auto">
          {aside}
        </aside>
      )}
    </div>
  );
}
