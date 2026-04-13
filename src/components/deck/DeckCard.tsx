"use client";

import { MoreVertical } from "@/lib/lucide";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { Badge } from "@/components/ui/Badge";
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

  return (
    <Card hoverable className="space-y-4 p-5" onClick={() => router.push(`/decks/${deck.id}`)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p
            className="truncate text-lg font-semibold text-slate-900"
            title={isNameTruncated ? deck.name : undefined}
          >
            {displayName}
          </p>
          <Badge label={`${deck.cardCount} cards`} color="gray" />
        </div>

        <IconButton aria-label="Deck actions" onClick={handleMenuOpen} size="small">
          <MoreVertical size={18} />
        </IconButton>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${dueColorClass}`}>
            {deck.dueToday} due
          </p>
          <p className="text-xs text-slate-500">
            Last studied: {deck.lastStudied ? formatDate(deck.lastStudied) : "Never studied"}
          </p>
        </div>

        <div className="relative inline-flex items-center justify-center">
          <CircularProgress
            variant="determinate"
            value={Math.max(0, Math.min(100, Math.round(deck.masteryPercent)))}
            size={54}
            thickness={5}
            sx={{ color: "#6366f1" }}
          />
          <span className="absolute text-xs font-semibold text-slate-700">
            {Math.round(deck.masteryPercent)}%
          </span>
        </div>
      </div>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem
          onClick={(event) => {
            event.stopPropagation();
            handleMenuClose();
            onRename?.();
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={(event) => {
            event.stopPropagation();
            handleMenuClose();
            onArchive?.();
          }}
        >
          Archive
        </MenuItem>
      </Menu>
    </Card>
  );
}
