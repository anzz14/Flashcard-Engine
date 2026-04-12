"use client";

import { Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import DeckCard from "@/components/deck/DeckCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { DeckSummary } from "@/types/deck";

type DeckGridProps = {
  decks: DeckSummary[];
  onDeckChange?: () => void;
};

async function patchDeck(deckId: string, payload: { name?: string; archived?: boolean }) {
  const response = await fetch(`/api/decks/${deckId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update deck");
  }
}

export default function DeckGrid({ decks, onDeckChange }: DeckGridProps) {
  const router = useRouter();
  const { show } = useToast();
  const triggerDeckChange = onDeckChange ?? (() => undefined);

  const handleRename = async (deck: DeckSummary) => {
    const nextName = window.prompt("Rename deck", deck.name)?.trim();
    if (!nextName || nextName === deck.name) {
      return;
    }

    try {
      await patchDeck(deck.id, { name: nextName });
      show("Deck renamed", "success");
      triggerDeckChange();
    } catch {
      show("Failed to rename deck", "error");
    }
  };

  const handleArchive = async (deck: DeckSummary) => {
    const confirmed = window.confirm(`Archive "${deck.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await patchDeck(deck.id, { archived: true });
      show("Deck archived", "success");
      triggerDeckChange();
    } catch {
      show("Failed to archive deck", "error");
    }
  };

  if (decks.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="h-10 w-10" />}
        title="No decks yet"
        action={
          <Button variant="primary" onClick={() => router.push("/decks/new")}>
            Create your first deck
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          onRename={() => {
            void handleRename(deck);
          }}
          onArchive={() => {
            void handleArchive(deck);
          }}
        />
      ))}
    </div>
  );
}
