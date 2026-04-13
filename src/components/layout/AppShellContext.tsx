"use client";

import { createContext, useContext } from "react";

type AppShellContextValue = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
};

export const AppShellContext = createContext<AppShellContextValue | undefined>(
  undefined
);

export function useAppShell(): AppShellContextValue {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used inside AppShell");
  }
  return context;
}
