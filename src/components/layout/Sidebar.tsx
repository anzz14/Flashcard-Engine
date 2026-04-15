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
import { useEffect, useState } from "react";
import { useAppShell } from "@/components/layout/AppShellContext";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

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
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      window.location.assign("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-[#151515]">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <p className="text-xl font-semibold tracking-tight text-[#f5e6c8]">
          {sidebarCollapsed ? "FE" : "Flashcard Engine"}
        </p>
        <Tooltip title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
          <motion.button
            type="button"
            className="hidden rounded-md p-1.5 text-[#ff6a3d] hover:bg-[rgba(255,59,0,0.08)] hover:text-[#ff6a3d] md:inline-flex"
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
                  onClick={() => setPendingHref(item.href)}
                  sx={{
                    borderRadius: "0.75rem",
                    mb: 0.5,
                    px: sidebarCollapsed ? 1.25 : 1.5,
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    backgroundColor: active ? "rgba(255,59,0,0.15)" : "transparent",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: active ? "rgba(255,59,0,0.25)" : "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "#ffffff",
                      minWidth: sidebarCollapsed ? 0 : 34,
                      justifyContent: "center",
                    }}
                  >
                    {pendingHref === item.href ? <Spinner size="sm" color="#ff6a3d" /> : item.icon}
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
          <p className="truncate pl-0.5 text-xs text-white">{session?.user?.email ?? "Signed in"}</p>
        ) : null}
        <Tooltip title="Logout" placement="right" disableHoverListener={!sidebarCollapsed}>
          <Button
            variant="ghost"
            fullWidth
            size="small"
            disabled={isLoggingOut}
            sx={{
              mt: 1,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              px: sidebarCollapsed ? 1.25 : 0.5,
              minWidth: 0,
              color: "#ff6a3d",
              "&:hover": { color: "#ff6a3d", backgroundColor: "rgba(255,59,0,0.08)" },
            }}
            onClick={() => {
              void handleLogout();
            }}
            aria-label="Logout"
          >
            {isLoggingOut ? (
              <Spinner size="sm" color="#ff6a3d" />
            ) : sidebarCollapsed ? (
              <LogOut size={18} />
            ) : (
              "Logout"
            )}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
