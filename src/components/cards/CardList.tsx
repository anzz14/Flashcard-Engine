"use client";

import { Plus } from "@/lib/lucide";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { usePathname, useSearchParams } from "next/navigation";
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
      <Stack spacing={3} sx={{ pt: 1 }}>
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            sx={{ color: "#ffffff", "&:hover": { backgroundColor: "transparent" } }}
          >
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
        </Box>
      </Stack>
    </Modal>
  );
}

export default function CardList({ deckId, topics }: CardListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const topicsFromUrl = useMemo(() => {
    const many = searchParams
      .getAll("topic")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (many.length > 0) {
      return many;
    }

    const single = searchParams.get("topic")?.trim();
    return single ? [single] : [];
  }, [searchParams]);
  const [cards, setCards] = useState<CardWithSM2[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string[]>(topicsFromUrl);
  const [dueFilter, setDueFilter] = useState<"all" | "due" | "not-due">("all");
  const [viewingCard, setViewingCard] = useState<CardWithSM2 | null>(null);
  const [editingCard, setEditingCard] = useState<CardWithSM2 | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardWithSM2 | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    setTopicFilter(topicsFromUrl);
  }, [topicsFromUrl]);

  const fetchCards = useCallback(async () => {
    const query = new URLSearchParams();
    topicFilter.forEach((topic) => query.append("topic", topic));
    if (search) query.set("search", search);
    if (dueFilter !== "all") query.set("due", dueFilter);

    const queryString = query.toString();
    const url = `/api/decks/${deckId}/cards${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, { method: "GET", cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }

    const data = (await response.json()) as CardWithSM2[];
    setCards(data);
    return data;
  }, [deckId, dueFilter, search, topicFilter]);

  const loadCards = useCallback(async () => {
    const allResponse = await fetch(`/api/decks/${deckId}/cards`, { cache: "no-store" });
    if (allResponse.ok) {
      const allData = (await allResponse.json()) as CardWithSM2[];
      setTotalCount(allData.length);
    }

    await fetchCards();
  }, [deckId, fetchCards]);

  // Reload cards whenever the pathname changes (e.g. returning from /edit)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (mounted) {
          setCards([]);
        }
        await loadCards();
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
  }, [loadCards, show, pathname]);

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
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setCards((prev) => prev.filter((card) => card.id !== cardId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setDeletingCard(null);
      show("Card deleted", "success");
    } catch {
      show("Failed to delete card", "error");
    } finally {
      setIsDeleting(false);
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
          onTopicFilter={(topic) => setTopicFilter(topic ? [topic] : [])}
          onDueFilter={setDueFilter}
        />
        <Button
          variant="primary"
          startIcon={<Plus size={20} />}
          onClick={() => setShowAddModal(true)}
        >
          Add Card
        </Button>
      </div>

      <p className="text-sm text-white">
        {cards.length} of {totalCount} cards
      </p>

      <TableContainer className="rounded-xl border border-white/10 bg-[#151515]">
        <Table
          sx={{
            "& .MuiTableCell-root": {
              color: "#ffffff",
              borderBottomColor: "rgba(255,255,255,0.10)",
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              color: "#ff6a3d",
              fontWeight: 700,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell align="center">Topic</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Due</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                onView={(next) => setViewingCard(next)}
                onEdit={(next) => setEditingCard(next)}
                onDelete={(next) => {
                  setDeletingCard(next);
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

      <Modal open={viewingCard !== null} onClose={() => setViewingCard(null)} title="View Card" maxWidth="sm">
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.10)" }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white">Question</p>
            <p className="whitespace-pre-wrap text-sm text-[#ff6a3d]">{viewingCard?.question ?? ""}</p>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.10)" }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white">Answer</p>
            <p className="whitespace-pre-wrap text-sm text-[#ff6a3d]">{viewingCard?.answer ?? ""}</p>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.10)" }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white">Topic</p>
            <p className="text-sm text-[#ff6a3d]">{viewingCard?.topicTag?.trim() || "General"}</p>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" onClick={() => setViewingCard(null)}>
              Close
            </Button>
          </Box>
        </Stack>
      </Modal>

      <Modal open={deletingCard !== null} onClose={() => setDeletingCard(null)} title="Delete Card" maxWidth="sm">
        <Stack spacing={3} sx={{ pt: 1 }}>
          <p className="text-sm text-white">
            Are you sure you want to delete this card? This action cannot be undone.
          </p>

          {deletingCard ? (
            <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.10)" }}>
              <p className="text-sm font-medium text-[#ff6a3d]">{deletingCard.question}</p>
            </Box>
          ) : null}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="ghost"
              onClick={() => setDeletingCard(null)}
              disabled={isDeleting}
              sx={{ color: "#ffffff", "&:hover": { backgroundColor: "transparent" } }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={isDeleting || !deletingCard}
              onClick={() => {
                if (!deletingCard) return;
                void handleDelete(deletingCard.id);
              }}
            >
              Delete
            </Button>
          </Box>
        </Stack>
      </Modal>
    </div>
  );
}