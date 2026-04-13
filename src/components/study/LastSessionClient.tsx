"use client";

import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FlashCard from "@/components/study/FlashCard";
import RatingButtons from "@/components/study/RatingButtons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { CardWithSM2, ReviewRating } from "@/types/card";

type Props = {
  deckId: string;
  sessionDate: string;
  cards: Array<CardWithSM2 & { sessionRating: ReviewRating }>;
};

const ratingStyle: Record<ReviewRating, { bg: string; color: string }> = {
  AGAIN: { bg: "#fee2e2", color: "#991b1b" },
  HARD: { bg: "#ffedd5", color: "#9a3412" },
  GOOD: { bg: "#fef9c3", color: "#854d0e" },
  EASY: { bg: "#dcfce7", color: "#166534" },
};

export default function LastSessionClient({ deckId, sessionDate, cards }: Props) {
  const router = useRouter();
  const { show } = useToast();
  const [cardList, setCardList] = useState(cards);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = (cardId: string) => {
    if (activeCardId === cardId) {
      setActiveCardId(null);
      setIsFlipped(false);
      return;
    }

    setActiveCardId(cardId);
    setIsFlipped(false);
  };

  const handleRate = async (rating: ReviewRating) => {
    if (!activeCardId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: activeCardId, rating }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setCardList((prev) =>
        prev.map((c) => (c.id === activeCardId ? { ...c, sessionRating: rating } : c))
      );
      setActiveCardId(null);
      setIsFlipped(false);
      show("Card updated", "success");
    } catch {
      show("Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          Last Session - {formatDate(`${sessionDate}T00:00:00Z`)}
        </h1>
        <Button variant="secondary" onClick={() => router.push(`/decks/${deckId}`)}>
          Back to Deck
        </Button>
      </div>

      {cardList.map((card) => (
        <Card key={card.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-900">{card.question}</p>
            <Chip
              label={card.sessionRating}
              size="small"
              sx={{
                borderRadius: "9999px",
                fontWeight: 700,
                bgcolor: ratingStyle[card.sessionRating].bg,
                color: ratingStyle[card.sessionRating].color,
              }}
            />
          </div>

          {activeCardId === card.id ? (
            <div className="mt-4 space-y-4">
              <FlashCard
                question={card.question}
                answer={card.answer}
                topicTag={card.topicTag}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(true)}
              />

              {isFlipped ? (
                <RatingButtons card={card} onRate={handleRate} isSubmitting={isSubmitting} />
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex justify-start">
            <Button variant="secondary" onClick={() => handleOpen(card.id)}>
              {activeCardId === card.id ? "Close" : "Re-review"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}