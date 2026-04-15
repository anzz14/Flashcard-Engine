"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "@/lib/lucide";
import DeckDetailSkeleton from "@/components/deck/DeckDetailSkeleton";
import { Button } from "@/components/ui/Button";

type BackToDeckButtonProps = {
  deckId: string;
};

export default function BackToDeckButton({ deckId }: BackToDeckButtonProps) {
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
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-[#111111] px-4 py-6">
        <div className="mx-auto w-full max-w-6xl">
          <DeckDetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      startIcon={<ArrowLeft size={20} />}
      onClick={handleBack}
      sx={{ color: "#ff6a3d", "&:hover": { backgroundColor: "transparent" } }}
    >
      Back to Deck
    </Button>
  );
}