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
import { Spinner } from "@/components/ui/Spinner";
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
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isManagingCards, setIsManagingCards] = useState(false);

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

  const handleNavigate = (href: string, action: "start-session" | "manage-cards") => {
    if (action === "start-session" && isStartingSession) {
      return;
    }

    if (action === "manage-cards" && isManagingCards) {
      return;
    }

    if (action === "start-session") {
      setIsStartingSession(true);
    } else {
      setIsManagingCards(true);
    }

    router.push(href);
  };

  const getTopicChipSx = (isActive: boolean) => ({
    height: 22,
    fontSize: "0.68rem",
    fontWeight: 600,
    ...(isActive
      ? {
          backgroundColor: "rgba(255,59,0,0.06)",
          borderColor: "rgba(255,106,61,0.65)",
          color: "#ff6a3d",
        }
      : {
          backgroundColor: "rgba(255,255,255,0.015)",
          borderColor: "rgba(255,255,255,0.20)",
          color: "#ffffff",
        }),
    "& .MuiChip-label": {
      px: 0.75,
    },
    "&:hover": {
      backgroundColor: isActive ? "rgba(255,59,0,0.06)" : "rgba(255,255,255,0.015)",
    },
  });

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#151515] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-[#ff6a3d]">{deck.name}</h1>
          <IconButton aria-label="Rename deck" onClick={() => setRenameOpen(true)} sx={{ color: "#ffffff" }}>
            <Edit2 size={18} />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => handleNavigate(startSessionHref, "start-session")}
            disabled={isStartingSession}
          >
            {isStartingSession ? (
              <Spinner size="sm" color="#ff6a3d" />
            ) : (
              "Start Session"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleNavigate(`/decks/${deck.id}/edit`, "manage-cards")}
            disabled={isManagingCards}
          >
            {isManagingCards ? (
              <Spinner size="sm" color="#ff6a3d" />
            ) : (
              "Manage Cards"
            )}
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
          variant="outlined"
          label="All Topics"
          clickable
          onClick={() => setTopicFilter(null)}
          sx={getTopicChipSx(activeTopics.length === 0)}
        />

        {topicTags.map((topic) => (
          <Chip
            key={topic}
            variant="outlined"
            label={topic}
            clickable
            onClick={() => setTopicFilter(topic)}
            sx={getTopicChipSx(activeTopics.includes(topic))}
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
