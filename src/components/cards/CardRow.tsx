"use client";

import { MoreVertical } from "@/lib/lucide";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useState, type MouseEvent } from "react";
import { Badge, getTopicColor } from "@/components/ui/Badge";
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

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <TableRow hover>
      <TableCell>
        <Tooltip title={card.question} arrow>
          <span>{truncate(card.question, 60)}</span>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Tooltip title={card.answer} arrow>
          <span>{truncate(card.answer, 60)}</span>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Badge label={topic} color={getTopicColor(topic)} />
      </TableCell>

      <TableCell>
        <Chip
          size="small"
          label={card.isNew ? "New" : "Reviewed"}
          sx={
            card.isNew
              ? { backgroundColor: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }
              : { backgroundColor: "#dcfce7", color: "#166534", fontWeight: 600 }
          }
        />
      </TableCell>

      <TableCell>
        <div className="text-xs text-slate-600">
          <p>Ease: {card.easeFactor.toFixed(1)}</p>
          <p>Due: {formatDate(card.nextReviewDate)}</p>
        </div>
      </TableCell>

      <TableCell align="right">
        <IconButton size="small" aria-label="Card actions" onClick={handleOpenMenu}>
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
