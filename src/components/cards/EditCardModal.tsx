"use client";

import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import type { CardWithSM2 } from "@/types/card";

type EditCardModalProps = {
  card: CardWithSM2 | null;
  onClose: () => void;
  onSave: (data: {
    question: string;
    answer: string;
    topicTag?: string;
  }) => Promise<void>;
};

export default function EditCardModal({ card, onClose, onSave }: EditCardModalProps) {
  const open = card !== null;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topicTag, setTopicTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!card) {
      setQuestion("");
      setAnswer("");
      setTopicTag("");
      setError(null);
      return;
    }

    setQuestion(card.question);
    setAnswer(card.answer);
    setTopicTag(card.topicTag ?? "");
    setError(null);
  }, [card]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      setError("Question and answer are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        question: question.trim(),
        answer: answer.trim(),
        topicTag: topicTag.trim() || undefined,
      });
      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Card" maxWidth="md">
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

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            sx={{ color: "#ffffff", "&:hover": { backgroundColor: "transparent" } }}
          >
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
