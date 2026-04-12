"use client";

import AddIcon from "@mui/icons-material/Add";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useState } from "react";
import CardRow from "@/components/cards/CardRow";
import CardSearch from "@/components/cards/CardSearch";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { CardWithSM2 } from "@/types/card";

type CardListProps = {
  deckId: string;
  topics: string[];
};

type CardFormValues = {
  question: string;
  answer: string;
  topicTag?: string | null;
};

type CardModalProps = {
  open: boolean;
  title: string;
  initialValues?: CardFormValues;
  onClose: () => void;
  onSave: (values: CardFormValues) => Promise<void>;
};

function CardFormModal({
  open,
  title,
  initialValues,
  onClose,
  onSave,
}: CardModalProps) {
  const [question, setQuestion] = useState(initialValues?.question ?? "");
  const [answer, setAnswer] = useState(initialValues?.answer ?? "");
  const [topicTag, setTopicTag] = useState(initialValues?.topicTag ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQuestion(initialValues?.question ?? "");
    setAnswer(initialValues?.answer ?? "");
    setTopicTag(initialValues?.topicTag ?? "");
  }, [initialValues, open]);

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4 pt-1">
        <TextField
          label="Question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          fullWidth
          multiline
          minRows={2}
        />

        <TextField
          label="Answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          fullWidth
          multiline
          minRows={3}
        />

        <TextField
          label="Topic (optional)"
          value={topicTag ?? ""}
          onChange={(event) => setTopicTag(event.target.value)}
          fullWidth
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={saving || question.trim().length === 0 || answer.trim().length === 0}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave({
                  question: question.trim(),
                  answer: answer.trim(),
                  topicTag: topicTag?.trim() || null,
                });
                onClose();
              } finally {
                setSaving(false);
              }
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function CardList({ deckId, topics }: CardListProps) {
  const [cards, setCards] = useState<CardWithSM2[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardWithSM2 | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { show } = useToast();

  const fetchCards = useCallback(async () => {
    const query = new URLSearchParams();
    if (topicFilter) query.set("topic", topicFilter);
    if (search) query.set("search", search);

    const queryString = query.toString();
    const url = `/api/decks/${deckId}/cards${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }

    const data = (await response.json()) as CardWithSM2[];
    setCards(data);
  }, [deckId, search, topicFilter]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const allResponse = await fetch(`/api/decks/${deckId}/cards`);
        if (allResponse.ok && mounted) {
          const allData = (await allResponse.json()) as CardWithSM2[];
          setTotalCount(allData.length);
        }

        await fetchCards();
      } catch {
        if (mounted) {
          show("Failed to load cards", "error");
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [deckId, fetchCards, show]);

  const availableTopics = useMemo(() => {
    const dynamicTopics = new Set(
      cards
        .map((card) => card.topicTag?.trim())
        .filter((topic): topic is string => Boolean(topic))
    );

    topics.forEach((topic) => {
      if (topic.trim()) dynamicTopics.add(topic.trim());
    });

    return Array.from(dynamicTopics).sort((a, b) => a.localeCompare(b));
  }, [cards, topics]);

  const handleDelete = async (cardId: string) => {
    try {
      const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setCards((prev) => prev.filter((card) => card.id !== cardId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      show("Card deleted", "success");
    } catch {
      show("Failed to delete card", "error");
    }
  };

  const handleSaveEdit = async (data: CardFormValues) => {
    if (!editingCard) return;

    const response = await fetch(`/api/decks/${deckId}/cards/${editingCard.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      show("Failed to update card", "error");
      throw new Error("Update failed");
    }

    const updated = (await response.json()) as CardWithSM2;
    setCards((prev) => prev.map((card) => (card.id === updated.id ? updated : card)));
    setEditingCard(null);
    show("Card updated", "success");
  };

  const handleAddCard = async (data: CardFormValues) => {
    const response = await fetch(`/api/decks/${deckId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      show("Failed to add card", "error");
      throw new Error("Create failed");
    }

    const created = (await response.json()) as CardWithSM2;
    setCards((prev) => [created, ...prev]);
    setTotalCount((prev) => prev + 1);
    show("Card added", "success");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardSearch
          topics={availableTopics}
          onSearch={setSearch}
          onTopicFilter={setTopicFilter}
        />
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddModal(true)}
        >
          Add Card
        </Button>
      </div>

      <p className="text-sm text-slate-600">
        {cards.length} of {totalCount} cards
      </p>

      <TableContainer className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                onEdit={(next) => setEditingCard(next)}
                onDelete={(cardId) => {
                  void handleDelete(cardId);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CardFormModal
        open={showAddModal}
        title="Add Card"
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCard}
      />

      <CardFormModal
        open={editingCard !== null}
        title="Edit Card"
        initialValues={
          editingCard
            ? {
                question: editingCard.question,
                answer: editingCard.answer,
                topicTag: editingCard.topicTag,
              }
            : undefined
        }
        onClose={() => setEditingCard(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
