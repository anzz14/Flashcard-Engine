"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CardList from "@/components/cards/CardList";
import EditDeckSkeleton from "@/components/deck/EditDeckSkeleton";
import { ArrowLeft } from "@/lib/lucide";
import { Button } from "@/components/ui/Button";

type EditDeckCardsClientProps = {
  deckId: string;
  deckCardCount: number;
  uniqueTopics: string[];
};

export default function EditDeckCardsClient({
  deckId,
  deckCardCount,
  uniqueTopics,
}: EditDeckCardsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    window.requestAnimationFrame(() => {
      router.push(`/decks/${deckId}`);
    });
  };

  if (isLoading) {
    return <EditDeckSkeleton deckCardCount={deckCardCount} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          startIcon={<ArrowLeft size={20} />}
          onClick={handleBack}
          sx={{ color: "#ff6a3d", "&:hover": { backgroundColor: "transparent" } }}
        >
          Back to Deck
        </Button>
      </div>

      <p className="font-bold text-white">{deckCardCount} cards total</p>

      <CardList deckId={deckId} topics={uniqueTopics} />
    </div>
  );
}