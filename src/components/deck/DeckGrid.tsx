"use client";

import { Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeckCard from "@/components/deck/DeckCard";
import RenameDeckModal from "@/components/deck/RenameDeckModal";
import ArchiveDeckModal from "@/components/deck/ArchiveDeckModal";
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
  const [renamingDeck, setRenamingDeck] = useState<DeckSummary | null>(null);
  const [archivingDeck, setArchivingDeck] = useState<DeckSummary | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const handleRename = (deck: DeckSummary) => {
    setRenamingDeck(deck);
  };

  const handleArchiveClick = (deck: DeckSummary) => {
    setArchivingDeck(deck);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingDeck) return;

    setArchiveLoading(true);
    try {
      await patchDeck(archivingDeck.id, { archived: true });
      show("Deck archived", "success");
      setArchivingDeck(null);
      triggerDeckChange();
    } catch {
      show("Failed to archive deck", "error");
    } finally {
      setArchiveLoading(false);
    }
  };

  if (decks.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="h-10 w-10" />}
        title="No decks yet"
        className="border-white/10 bg-transparent shadow-none"
        action={
          <Button variant="primary" onClick={() => router.push("/decks/new")}>
            Create your first deck
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onRename={() => {
              handleRename(deck);
            }}
            onArchive={() => {
              handleArchiveClick(deck);
            }}
          />
        ))}
      </div>

      <RenameDeckModal
        open={renamingDeck !== null}
        deckName={renamingDeck?.name ?? ""}
        deckId={renamingDeck?.id ?? ""}
        onClose={() => setRenamingDeck(null)}
        onRenamed={() => {
          show("Deck renamed", "success");
          triggerDeckChange();
        }}
      />

      <ArchiveDeckModal
        open={archivingDeck !== null}
        deck={archivingDeck}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchivingDeck(null)}
        loading={archiveLoading}
      />

      <RenameDeckModal
        open={renamingDeck !== null}
        deckName={renamingDeck?.name ?? ""}
        deckId={renamingDeck?.id ?? ""}
        onClose={() => setRenamingDeck(null)}
        onRenamed={() => {
          show("Deck renamed", "success");
          triggerDeckChange();
        }}
      />
    </>
  );
}
