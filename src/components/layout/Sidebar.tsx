"use client";

import { LayoutDashboard, BookOpen, Settings, ChevronsLeft, LogOut } from "@/lib/lucide";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppShell } from "@/components/layout/AppShellContext";
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
  const { sidebarCollapsed, toggleSidebarCollapsed } = useAppShell();

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-[#151515]">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <p className="text-xl font-semibold tracking-tight text-white">
          {sidebarCollapsed ? "FE" : "Flashcard Engine"}
        </p>
        <Tooltip title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
          <motion.button
            type="button"
            className="hidden rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white md:inline-flex"
            onClick={toggleSidebarCollapsed}
            whileTap={{ scale: 0.92 }}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.span
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <ChevronsLeft size={18} />
            </motion.span>
          </motion.button>
        </Tooltip>
      </div>

      <nav className="flex-1 px-2 py-4">
        <List disablePadding>
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Tooltip
                key={item.href}
                title={item.label}
                placement="right"
                disableHoverListener={!sidebarCollapsed}
              >
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: "0.75rem",
                    mb: 0.5,
                    px: sidebarCollapsed ? 1.25 : 1.5,
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    backgroundColor: active ? "rgba(255,59,0,0.15)" : "transparent",
                    color: active ? "#ff6a3d" : "#a1a1a1",
                    "&:hover": {
                      backgroundColor: active ? "rgba(255,59,0,0.25)" : "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? "#ff6a3d" : "#727272",
                      minWidth: sidebarCollapsed ? 0 : 34,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed ? (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ListItemText
                        primary={item.label}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: active ? 700 : 500,
                            fontSize: 14,
                          },
                        }}
                      />
                    </motion.div>
                  ) : null}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        {!sidebarCollapsed ? (
          <p className="truncate text-xs text-zinc-400">{session?.user?.email ?? "Signed in"}</p>
        ) : null}
        <Tooltip title="Logout" placement="right" disableHoverListener={!sidebarCollapsed}>
          <Button
            variant="ghost"
            fullWidth
            size="small"
            sx={{ mt: 1, justifyContent: sidebarCollapsed ? "center" : "flex-start", px: 0.5 }}
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Logout"
          >
            {sidebarCollapsed ? <LogOut size={16} /> : "Logout"}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
