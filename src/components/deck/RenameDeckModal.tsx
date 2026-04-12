"use client";

import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

type RenameDeckModalProps = {
  open: boolean;
  deckName: string;
  deckId: string;
  onClose: () => void;
  onRenamed: (name: string) => void;
};

export default function RenameDeckModal({
  open,
  deckName,
  deckId,
  onClose,
  onRenamed,
}: RenameDeckModalProps) {
  const [name, setName] = useState(deckName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(deckName);
      setError(null);
    }
  }, [deckName, open]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Deck name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Rename deck failed");
      }

      onRenamed(trimmed);
      onClose();
    } catch {
      setError("Failed to rename deck. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rename Deck" maxWidth="sm">
      <div className="space-y-4 pt-1">
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="Deck name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          fullWidth
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Spinner size="sm" className="text-white" /> : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
