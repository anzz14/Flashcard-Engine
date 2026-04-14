"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import { Button } from "@/components/ui/Button";
import type { DeckSummary } from "@/types/deck";

type ArchiveDeckModalProps = {
  open: boolean;
  deck: DeckSummary | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export default function ArchiveDeckModal({
  open,
  deck,
  onConfirm,
  onCancel,
  loading = false,
}: ArchiveDeckModalProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="text-lg font-semibold text-white">
        Archive "{deck?.name}"?
      </DialogTitle>
      <DialogContent className="space-y-4">
        <div className="space-y-3 text-sm text-white/80">
          <p>
            You're about to archive this deck. Once archived:
          </p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>The deck will no longer be accessible</li>
            <li>You won't be able to study from it</li>
            <li>Your progress in this deck will be hidden</li>
            <li>This action cannot be undone</li>
          </ul>
          <p className="mt-4 font-medium text-[#ff6a3d]">
            Are you absolutely sure?
          </p>
        </div>
      </DialogContent>
      <DialogActions className="gap-2 px-6 pb-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          sx={{
            color: "#ffffff",
            "&:hover": {
              color: "#ffffff",
              backgroundColor: "rgba(255,255,255,0.06)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="ghost"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            color: "#ff6a3d",
            border: "1px solid rgba(255,106,61,0.7)",
            backgroundColor: "transparent !important",
            "&:hover": {
              color: "#ff6a3d",
              borderColor: "#ff6a3d",
              backgroundColor: "rgba(255,106,61,0.08) !important",
            },
          }}
        >
          <span className="inline-flex items-center gap-2">
            {loading ? <CircularProgress size={14} sx={{ color: "#ff6a3d" }} /> : null}
            {loading ? "Archiving..." : "Archive Deck"}
          </span>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
