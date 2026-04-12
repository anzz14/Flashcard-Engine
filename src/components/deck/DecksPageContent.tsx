"use client";

import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateDeckModal from "@/components/deck/CreateDeckModal";
import DeckGrid from "@/components/deck/DeckGrid";
import { Button } from "@/components/ui/Button";
import type { DeckSummary } from "@/types/deck";

type DecksPageContentProps = {
  decks: DeckSummary[];
};

export default function DecksPageContent({ decks }: DecksPageContentProps) {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const router = useRouter();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Decks</h1>
          <p className="text-sm text-slate-600">Browse and manage your flashcard decks.</p>
        </div>

        <Button variant="primary" startIcon={<AddIcon />} onClick={() => setOpenCreateModal(true)}>
          New Deck
        </Button>
      </div>

      <DeckGrid decks={decks} onDeckChange={() => router.refresh()} />

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
