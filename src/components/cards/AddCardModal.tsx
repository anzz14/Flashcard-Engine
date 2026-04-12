"use client";

import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import type { CardWithSM2 } from "@/types/card";

type AddCardModalProps = {
  open: boolean;
  deckId: string;
  onClose: () => void;
  onAdd: (card: CardWithSM2) => void;
};

export default function AddCardModal({ open, deckId, onClose, onAdd }: AddCardModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topicTag, setTopicTag] = useState("");
  const [addAnother, setAddAnother] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuestion("");
      setAnswer("");
      setTopicTag("");
      setError(null);
      setAddAnother(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      setError("Question and answer are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          topicTag: topicTag.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Create card failed");
      }

      const created = (await response.json()) as CardWithSM2;
      onAdd(created);

      if (addAnother) {
        setQuestion("");
        setAnswer("");
        setTopicTag("");
      } else {
        onClose();
      }
    } catch {
      setError("Failed to add card. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Card" maxWidth="md">
      <div className="space-y-4 pt-1">
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="Question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          multiline
          minRows={3}
          fullWidth
        />

        <TextField
          label="Answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          multiline
          minRows={4}
          fullWidth
        />

        <TextField
          label="Topic Tag (optional)"
          value={topicTag}
          onChange={(event) => setTopicTag(event.target.value)}
          fullWidth
        />

        <FormControlLabel
          control={
            <Switch
              checked={addAnother}
              onChange={(_, checked) => setAddAnother(checked)}
            />
          }
          label="Add Another?"
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
