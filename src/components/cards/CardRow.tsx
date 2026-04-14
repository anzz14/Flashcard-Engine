"use client";

import { MoreVertical } from "@/lib/lucide";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useState, type MouseEvent } from "react";
import { Badge, getTopicColor, type BadgeColor } from "@/components/ui/Badge";
import { formatDate, truncate } from "@/lib/utils";
import type { CardWithSM2 } from "@/types/card";

type CardRowProps = {
  card: CardWithSM2;
  onView: (card: CardWithSM2) => void;
  onEdit: (card: CardWithSM2) => void;
  onDelete: (card: CardWithSM2) => void;
};

export default function CardRow({ card, onView, onEdit, onDelete }: CardRowProps) {
  const topic = card.topicTag?.trim() || "General";
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const reviewDate = new Date(card.nextReviewDate);
  const reviewDateStart = new Date(
    reviewDate.getFullYear(),
    reviewDate.getMonth(),
    reviewDate.getDate()
  );
  const isDue = !card.isNew && reviewDateStart.getTime() <= todayStart.getTime();

  const statusLabel = card.isNew ? "New" : isDue ? "Due" : "Scheduled";
  const statusColor: BadgeColor = statusLabel === "Due" ? "red" : statusLabel === "Scheduled" ? "green" : "gray";

  const dotColor = card.isNew
    ? "#94a3b8"
    : card.interval >= 7
      ? "#16a34a"
      : card.interval >= 3
        ? "#eab308"
        : "#ef4444";
  const tooltipLabel = card.isNew ? "Not attempted" : `Due date: ${formatDate(card.nextReviewDate)}`;

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <TableRow
      hover
      sx={{
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.04)",
        },
      }}
    >
      <TableCell>
        <Tooltip
          title={card.question}
          arrow
          placement="top"
          slotProps={{
            tooltip: { sx: { bgcolor: "#ff6a3d", color: "#000000" } },
            arrow: { sx: { color: "#ff6a3d" } },
          }}
        >
          <span>{truncate(card.question, 60)}</span>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Tooltip
          title={card.answer}
          arrow
          placement="top"
          slotProps={{
            tooltip: { sx: { bgcolor: "#ff6a3d", color: "#000000" } },
            arrow: { sx: { color: "#ff6a3d" } },
          }}
        >
          <span>{truncate(card.answer, 60)}</span>
        </Tooltip>
      </TableCell>

      <TableCell align="center">
        <Badge label={topic} color={getTopicColor(topic)} compact thinBorder />
      </TableCell>

      <TableCell align="center">
        <Badge label={statusLabel} color={statusColor} compact thinBorder />
      </TableCell>

      <TableCell align="center" sx={{ textAlign: "center" }}>
        <Tooltip
          title={tooltipLabel}
          arrow
          placement="top"
          slotProps={{
            tooltip: { sx: { bgcolor: "#ff6a3d", color: "#000000" } },
            arrow: { sx: { color: "#ff6a3d" } },
          }}
        >
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-label={tooltipLabel}
          />
        </Tooltip>
      </TableCell>

      <TableCell align="center">
        <IconButton size="small" aria-label="Card actions" onClick={handleOpenMenu} sx={{ color: "#ffffff" }}>
          <MoreVertical size={18} />
        </IconButton>

        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleCloseMenu}>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onView(card);
            }}
            sx={{ fontSize: '0.875rem', lineHeight: 1.5, minHeight: 0, py: 0.5 }}
          >
            <span style={{ fontSize: '0.875rem' }}>View</span>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onEdit(card);
            }}
            sx={{ fontSize: '0.875rem', lineHeight: 1.5, minHeight: 0, py: 0.5 }}
          >
            <span style={{ fontSize: '0.875rem' }}>Edit</span>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onDelete(card);
            }}
            sx={{ fontSize: '0.875rem', lineHeight: 1.5, minHeight: 0, py: 0.5 }}
          >
            <span style={{ fontSize: '0.875rem' }}>Delete</span>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}