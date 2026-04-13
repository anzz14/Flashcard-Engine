"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AppShellContext } from "@/components/layout/AppShellContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const contextValue = useMemo(
    () => ({
      sidebarOpen,
      sidebarCollapsed,
      setSidebarOpen,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarOpen((prev) => !prev),
      toggleSidebarCollapsed: () => setSidebarCollapsed((prev) => !prev),
    }),
    [sidebarOpen, sidebarCollapsed]
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-60 transform transition-all duration-300 md:static md:translate-x-0",
            sidebarCollapsed ? "md:w-20" : "md:w-60",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar />
        </div>

        {sidebarOpen ? (
          <button
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
