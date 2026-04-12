"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { Badge, getTopicColor } from "@/components/ui/Badge";
import { formatDate, truncate } from "@/lib/utils";
import type { CardWithSM2 } from "@/types/card";

type CardRowProps = {
  card: CardWithSM2;
  onEdit: (card: CardWithSM2) => void;
  onDelete: (cardId: string) => void;
};

export default function CardRow({ card, onEdit, onDelete }: CardRowProps) {
  const topic = card.topicTag?.trim() || "General";

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this card?");
    if (!confirmed) return;
    onDelete(card.id);
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
          label={card.isNew ? "New" : "Reviewing"}
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
        <div className="flex items-center justify-end gap-1">
          <IconButton size="small" aria-label="Edit card" onClick={() => onEdit(card)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Delete card" onClick={handleDelete}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
