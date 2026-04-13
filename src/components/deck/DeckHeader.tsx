"use client";

import { Edit2 } from "@/lib/lucide";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import AddCardModal from "@/components/cards/AddCardModal";
import BulkAddCardsModal from "@/components/deck/BulkAddCardsModal";
import RenameDeckModal from "@/components/deck/RenameDeckModal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { DeckWithStats } from "@/types/deck";

type DeckHeaderProps = {
  deck: DeckWithStats;
  onRename?: () => void;
};

export default function DeckHeader({ deck, onRename }: DeckHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();

  const [renameOpen, setRenameOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);

  const activeTopics = useMemo(() => {
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

  const topicTags = useMemo(() => {
    const seen = new Set<string>();

    for (const topic of deck.topics) {
      const tag = topic.topicTag?.trim();
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);
    }

    return Array.from(seen);
  }, [deck.topics]);

  const setTopicFilter = (topic: string | null) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("topic");

    if (!topic) {
      const query = nextParams.toString();
      router.push(`/decks/${deck.id}${query ? `?${query}` : ""}`);
      return;
    }

    const current = new Set(activeTopics);
    if (current.has(topic)) {
      current.delete(topic);
    } else {
      current.add(topic);
    }

    for (const selectedTopic of current) {
      nextParams.append("topic", selectedTopic);
    }

    const query = nextParams.toString();
    router.push(`/decks/${deck.id}${query ? `?${query}` : ""}`);
  };

  const startSessionHref = activeTopics.length === 1
    ? `/decks/${deck.id}/study?topic=${encodeURIComponent(activeTopics[0])}`
    : `/decks/${deck.id}/study`;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-slate-900">{deck.name}</h1>
          <IconButton aria-label="Rename deck" onClick={() => setRenameOpen(true)}>
            <Edit2 size={18} />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" href={startSessionHref}>
            Start Session
          </Button>
          <Button variant="secondary" href={`/decks/${deck.id}/edit`}>
            Manage Cards
          </Button>
          <Button variant="secondary" onClick={() => setBulkAddOpen(true)}>
            Bulk Add
          </Button>
          <Button variant="primary" onClick={() => setAddCardOpen(true)}>
            Add Card
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip
          label="All Topics"
          clickable
          onClick={() => setTopicFilter(null)}
          sx={
            activeTopics.length === 0
              ? { backgroundColor: "#e0e7ff", color: "#3730a3", fontWeight: 700 }
              : { backgroundColor: "#f1f5f9", color: "#334155" }
          }
        />

        {topicTags.map((topic) => (
          <Chip
            key={topic}
            label={topic}
            clickable
            onClick={() => setTopicFilter(topic)}
            sx={
              activeTopics.includes(topic)
                ? { backgroundColor: "#e0e7ff", color: "#3730a3", fontWeight: 700 }
                : { backgroundColor: "#f1f5f9", color: "#334155" }
            }
          />
        ))}
      </div>

      <RenameDeckModal
        open={renameOpen}
        deckName={deck.name}
        deckId={deck.id}
        onClose={() => setRenameOpen(false)}
        onRenamed={() => {
          show("Deck renamed", "success");
          onRename?.();
          router.refresh();
        }}
      />

      <AddCardModal
        open={addCardOpen}
        deckId={deck.id}
        onClose={() => setAddCardOpen(false)}
        onAdd={() => {
          show("Card added", "success");
          router.refresh();
        }}
      />

      <BulkAddCardsModal
        open={bulkAddOpen}
        deckId={deck.id}
        onClose={() => setBulkAddOpen(false)}
        onCompleted={(cardCount) => {
          show(`Bulk generation complete: ${cardCount} cards added`, "success");
          router.refresh();
        }}
      />
    </div>
  );
}
