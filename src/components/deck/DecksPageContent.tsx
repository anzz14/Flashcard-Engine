"use client";

import { Plus } from "@/lib/lucide";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import CreateDeckModal from "@/components/deck/CreateDeckModal";
import DeckGrid from "@/components/deck/DeckGrid";
import { Button } from "@/components/ui/Button";
import type { DeckSummary } from "@/types/deck";

type DecksPageContentProps = {
  decks: DeckSummary[];
};

export default function DecksPageContent({ decks }: DecksPageContentProps) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activitySort, setActivitySort] = useState<"latest" | "oldest">("latest");
  const [dueSort, setDueSort] = useState<"high" | "low">("high");
  const router = useRouter();

  const visibleDecks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = query
      ? decks.filter((deck) => deck.name.toLowerCase().includes(query))
      : decks;

    const sorted = [...filtered].sort((a, b) => {
      const aTime = a.lastStudied ? new Date(a.lastStudied).getTime() : null;
      const bTime = b.lastStudied ? new Date(b.lastStudied).getTime() : null;

      // Always place "Never studied" according to activity mode first.
      if (activitySort === "latest") {
        if (aTime === null && bTime !== null) return 1;
        if (aTime !== null && bTime === null) return -1;
      } else {
        if (aTime === null && bTime !== null) return -1;
        if (aTime !== null && bTime === null) return 1;
      }

      const dueResult = dueSort === "low" ? a.dueToday - b.dueToday : b.dueToday - a.dueToday;
      if (dueResult !== 0) {
        return dueResult;
      }

      if (activitySort === "latest") {
        if (aTime === null && bTime === null) return 0;
        if (aTime === null) return 1;
        if (bTime === null) return -1;
        return bTime - aTime;
      }

      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return -1;
      if (bTime === null) return 1;
      return aTime - bTime;
    });

    return sorted;
  }, [activitySort, decks, dueSort, searchQuery]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
        
          <p className="text-lg text-white">Browse and manage your flashcard decks.</p>
        </div>

        <Button variant="primary" startIcon={<Plus size={20} />} onClick={() => setOpenCreateModal(true)}>
          New Deck
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <TextField
            fullWidth
            size="small"
            label="Search decks"
            placeholder="Search by deck name"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <TextField
          select
          fullWidth
          size="small"
          label="Activity"
          value={activitySort}
          onChange={(event) => setActivitySort(event.target.value as "latest" | "oldest")}
        >
          <MenuItem value="latest">Latest to Oldest</MenuItem>
          <MenuItem value="oldest">Oldest to Latest</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Due"
          value={dueSort}
          onChange={(event) => setDueSort(event.target.value as "high" | "low")}
        >
          <MenuItem value="high">High to Low</MenuItem>
          <MenuItem value="low">Low to High</MenuItem>
        </TextField>
      </div>

      <p className="text-xs text-white">
        Showing {visibleDecks.length} of {decks.length} decks
      </p>

      <DeckGrid decks={visibleDecks} onDeckChange={() => router.refresh()} />

      <CreateDeckModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={(deckId) => {
          setOpenCreateModal(false);
          router.push(`/decks/${deckId}`);
          router.refresh();
        }}
      />
    </section>
  );
}
