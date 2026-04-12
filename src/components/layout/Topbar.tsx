"use client";

import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useStreak } from "@/hooks/useStreak";
import { useAppShell } from "@/components/layout/AppShellContext";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/decks")) return "My Decks";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Flashcard Engine";
}

function getInitials(name?: string | null, email?: string | null): string {
  const fromName = name?.trim();
  if (fromName) {
    const parts = fromName.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
  }

  const fromEmail = email?.trim();
  if (fromEmail) return fromEmail[0]?.toUpperCase() ?? "U";

  return "U";
}

export default function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { data: session } = useSession();
  const { streakCurrent } = useStreak();
  const { toggleSidebar } = useAppShell();

  const initials = getInitials(session?.user?.name, session?.user?.email);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <IconButton onClick={toggleSidebar} className="md:hidden!" aria-label="Open menu">
          <MenuIcon />
        </IconButton>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
          🔥 {streakCurrent}
        </div>
        <Avatar src={session?.user?.image ?? undefined} sx={{ width: 34, height: 34 }}>
          {initials}
        </Avatar>
      </div>
    </header>
  );
}
