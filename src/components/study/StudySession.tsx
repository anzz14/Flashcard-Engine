"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import EmptySession from "@/components/study/EmptySession";
import FlashCard from "@/components/study/FlashCard";
import RatingButtons from "@/components/study/RatingButtons";
import SessionProgress from "@/components/study/SessionProgress";
import SessionSummary from "@/components/study/SessionSummary";
import { useToast } from "@/components/ui/Toast";
import type { CardWithSM2, ReviewRating } from "@/types/card";
import type { UserStreak } from "@/types/user";

type StudySessionProps = {
  initialCards: CardWithSM2[];
  totalNew: number;
  totalDue: number;
  deckId: string;
};

type ReviewResponse = {
  streak: UserStreak;
};

export default function StudySession({
  initialCards,
  totalNew,
  totalDue,
  deckId,
}: StudySessionProps) {
  const [cards] = useState<CardWithSM2[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, ReviewRating>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(initialCards.length === 0);
  const [streakData, setStreakData] = useState<UserStreak | null>(null);
  const { show } = useToast();

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? currentIndex / cards.length : 0;

  useEffect(() => {
    const captureBaselineStreak = async () => {
      try {
        const response = await fetch("/api/user/streak");
        if (!response.ok) return;
        const data = (await response.json()) as { streakCurrent?: number };
        if (typeof data.streakCurrent === "number") {
          window.sessionStorage.setItem(
            "study:preSessionStreak",
            String(data.streakCurrent)
          );
        }
      } catch {
        // No-op if streak baseline cannot be captured.
      }
    };

    void captureBaselineStreak();
  }, []);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleRate = async (rating: ReviewRating) => {
    if (!currentCard || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId: currentCard.id, rating }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      const data = (await response.json()) as ReviewResponse;

      setRatings((prev) => ({
        ...prev,
        [currentCard.id]: rating,
      }));

      if (currentIndex + 1 >= cards.length) {
        setSessionComplete(true);
        setStreakData(data.streak ?? null);
      } else {
        setCurrentIndex((index) => index + 1);
        setIsFlipped(false);
      }
    } catch {
      show("Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTopic = useMemo(() => currentCard?.topicTag ?? null, [currentCard]);

  if (initialCards.length === 0) {
    return <EmptySession deckId={deckId} />;
  }

  if (sessionComplete) {
    return (
      <SessionSummary
        ratings={ratings}
        totalCards={cards.length}
        streakData={streakData}
        deckId={deckId}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SessionProgress
        currentIndex={currentIndex + 1}
        total={cards.length}
        topicTag={activeTopic}
        onExit={() => {
          show(`Session exited (${totalNew} new / ${totalDue} due)`, "info");
        }}
      />

      {currentCard ? (
        <FlashCard
          question={currentCard.question}
          answer={currentCard.answer}
          topicTag={currentCard.topicTag}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />
      ) : null}

      <AnimatePresence>
        {isFlipped && currentCard ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <RatingButtons
              card={currentCard}
              onRate={(rating) => {
                void handleRate(rating);
              }}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="text-center text-xs text-slate-500">
        Progress: {Math.round(progress * 100)}%
      </p>
    </div>
  );
}
