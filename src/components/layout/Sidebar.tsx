"use client";

import { LayoutDashboard, BookOpen, Settings } from "@/lib/lucide";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "My Decks", href: "/decks", icon: <BookOpen size={18} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-5">
        <p className="text-lg font-bold text-slate-900">Flashcard Engine</p>
      </div>

      <nav className="flex-1 px-2 py-4">
        <List disablePadding>
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: "0.75rem",
                  mb: 0.5,
                  backgroundColor: active ? "#e0e7ff" : "transparent",
                  color: active ? "#3730a3" : "#334155",
                  "&:hover": {
                    backgroundColor: active ? "#c7d2fe" : "#f1f5f9",
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? "#3730a3" : "#64748b", minWidth: 34 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <p className="truncate text-xs text-slate-500">{session?.user?.email ?? "Signed in"}</p>
        <Button
          variant="ghost"
          fullWidth
          size="small"
          sx={{ mt: 1, justifyContent: "flex-start", px: 0.5 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
