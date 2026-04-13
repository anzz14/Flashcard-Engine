"use client";

import { MoreVertical } from "@/lib/lucide";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
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
  const menuOpen = Boolean(anchorEl);
  const displayName = truncate(deck.name, 40);
  const isNameTruncated = displayName !== deck.name;
  const dueColorClass =
    deck.dueToday < 3
      ? "text-emerald-600"
      : deck.dueToday < 10
        ? "text-amber-500"
        : "text-orange-600";
  const reviewedCount = Math.max(0, deck.cardCount - deck.newCount);

  const progressLegend = [
    {
      label: "Reviewed",
      value: reviewedCount,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
    },
  ] as const;

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
        </div>

        <div className="flex items-center gap-1.5">
          <p className="text-xs text-slate-500">{deck.cardCount} cards</p>
          <IconButton
            aria-label="Deck actions"
            onClick={handleMenuOpen}
            size="small"
          >
            <MoreVertical size={18} />
          </IconButton>
        </div>
      </div>

      <div className="flex items-center justify-between ">
        <div className="space-y-2">
          <p className={`text-sm mt-8 font-semibold ${dueColorClass}`}>
            {deck.dueToday} due
          </p>
          <p className="text-[11px] -mt-2 text-slate-500">
            Last studied: {deck.lastStudied ? formatDate(deck.lastStudied) : "Never studied"}
          </p>
        </div>

        <div className="mt-12 mr-3 grid gap-1 text-[10px] leading-none sm:grid-cols-1 sm:gap-2">
          {progressLegend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className={`font-semibold ${item.textColor}`}>
                {item.value}
              </span>
              <span className="text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem
          sx={{ fontSize: "0.82rem", lineHeight: 1.35, minHeight: 0, py: 0.5 }}
          onClick={(event) => {
            event.stopPropagation();
            handleMenuClose();
            onRename?.();
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          sx={{ fontSize: "0.82rem", lineHeight: 1.35, minHeight: 0, py: 0.5 }}
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
