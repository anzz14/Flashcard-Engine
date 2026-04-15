"use client";

import { MoreVertical } from "@/lib/lucide";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Spinner } from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { Card } from "@/components/ui/Card";
import { formatDate, truncate } from "@/lib/utils";
import type { DeckSummary } from "@/types/deck";

type DeckCardProps = {
  deck: DeckSummary;
  onRename?: () => void;
  onArchive?: () => void;
};

export default function DeckCard({ deck, onRename, onArchive }: DeckCardProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const displayName = truncate(deck.name, 40);
  const isNameTruncated = displayName !== deck.name;
  const dueColorClass =
    deck.dueToday < 3
      ? "text-emerald-600"
      : deck.dueToday < 10
        ? "text-amber-500"
        : "text-orange-600";

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDeck = () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    router.push(`/decks/${deck.id}`);
  };

  return (
    <Card hoverable className="relative space-y-4 p-5" onClick={handleOpenDeck}>
      {isNavigating ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/10">
          <Spinner size="md" color="#ff6a3d" />
        </div>
      ) : null}

      <div
        className={
          isNavigating
            ? "flex items-start justify-between gap-3 pointer-events-none opacity-0"
            : "flex items-start justify-between gap-3"
        }
      >
        <div className="min-w-0 space-y-2">
          <p
            className="truncate text-lg font-semibold text-[#ff6a3d]"
            title={isNameTruncated ? deck.name : undefined}
          >
            {displayName}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <p className="text-xs text-white">{deck.cardCount} cards</p>
          <IconButton
            aria-label="Deck actions"
            onClick={handleMenuOpen}
            size="small"
            sx={{ color: "#ffffff" }}
          >
            <MoreVertical size={18} className="text-white" />
          </IconButton>
        </div>
      </div>

      <div className={isNavigating ? "pointer-events-none space-y-2 opacity-0" : "space-y-2"}>
        <p className={`text-sm mt-8 font-semibold ${dueColorClass}`}>
          {deck.dueToday} due
        </p>
        <p className="text-[11px] -mt-2 text-white">
          Last studied: {deck.lastStudied ? formatDate(deck.lastStudied) : "Never studied"}
        </p>
      </div>

      {!isNavigating ? (
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={(event) => event.stopPropagation()}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: "#151515",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#ffffff",
                boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              },
            },
          }}
        >
          <MenuItem
            sx={{
              fontSize: "0.82rem",
              lineHeight: 1.35,
              minHeight: 0,
              py: 0.5,
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.06)",
              },
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleMenuClose();
              onRename?.();
            }}
          >
            Rename
          </MenuItem>
          <MenuItem
            sx={{
              fontSize: "0.82rem",
              lineHeight: 1.35,
              minHeight: 0,
              py: 0.5,
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.06)",
              },
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleMenuClose();
              onArchive?.();
            }}
          >
            Archive
          </MenuItem>
        </Menu>
      ) : null}
    </Card>
  );
}
