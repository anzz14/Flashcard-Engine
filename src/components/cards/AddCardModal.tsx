"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
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
      <Stack spacing={2.5} sx={{ pt: 1 }}>
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
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#ff6a3d",
                  "&:hover": {
                    backgroundColor: "rgba(255,106,61,0.08)",
                  },
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#ff6a3d",
                },
              }}
            />
          }
          label="Add Another?"
          sx={{ color: "#ffffff" }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#ffffff",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleSave()}
            disabled={saving}
            sx={{
              color: "#ff6a3d !important",
              borderColor: "#ff6a3d !important",
              "&:hover": {
                borderColor: "#ff3b00 !important",
                backgroundColor: "rgba(255,59,0,0.08) !important",
              },
              "&.Mui-disabled": {
                color: "rgba(255,106,61,0.45) !important",
                borderColor: "rgba(255,106,61,0.35) !important",
              },
            }}
          >
            {saving ? <Spinner size="sm" className="text-white" /> : "Save"}
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
}
