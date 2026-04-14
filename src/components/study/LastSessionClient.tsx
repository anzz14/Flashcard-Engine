"use client";

import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useEffect, useMemo, useState } from "react";
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

type SessionPageRating = Exclude<ReviewRating, "AGAIN">;

const ratingStyle: Record<ReviewRating, { bg: string; color: string }> = {
  AGAIN: { bg: "rgba(220, 38, 38, 0.14)", color: "#fca5a5" },
  HARD: { bg: "rgba(249, 115, 22, 0.14)", color: "#fdba74" },
  GOOD: { bg: "rgba(250, 204, 21, 0.14)", color: "#fde047" },
  EASY: { bg: "rgba(34, 197, 94, 0.14)", color: "#86efac" },
};

const ratingLabels: Record<SessionPageRating, string> = {
  HARD: "Hard",
  GOOD: "Good",
  EASY: "Easy",
};

const ratingOptions: SessionPageRating[] = ["HARD", "GOOD", "EASY"];

function toSessionPageRating(rating: ReviewRating): SessionPageRating {
  return rating === "AGAIN" ? "HARD" : rating;
}

export default function LastSessionClient({ deckId, sessionDate, cards }: Props) {
  const router = useRouter();
  const { show } = useToast();
  const [cardList, setCardList] = useState(cards);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRatings, setSelectedRatings] = useState<SessionPageRating[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return cardList.filter((card) => {
      const matchesSearch =
        query.length === 0 ||
        card.question.toLowerCase().includes(query) ||
        card.answer.toLowerCase().includes(query) ||
        (card.topicTag ?? "").toLowerCase().includes(query);

      const matchesRating =
        selectedRatings.length === 0 ||
        selectedRatings.includes(toSessionPageRating(card.sessionRating));

      return matchesSearch && matchesRating;
    });
  }, [cardList, searchQuery, selectedRatings]);

  useEffect(() => {
    if (!activeCardId) {
      return;
    }

    const stillVisible = filteredCards.some((card) => card.id === activeCardId);
    if (!stillVisible) {
      setActiveCardId(null);
      setIsFlipped(false);
    }
  }, [activeCardId, filteredCards]);

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
        <h1 className="text-2xl font-bold text-[#ff6a3d]">
          Last Session - {formatDate(`${sessionDate}T00:00:00Z`)}
        </h1>
        <Button variant="secondary" onClick={() => router.push(`/decks/${deckId}`)}>
          Back to Deck
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TextField
          fullWidth
          size="small"
          label="Search cards"
          placeholder="Search by question, answer, or topic"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <TextField
          select
          fullWidth
          size="small"
          label="Difficulty"
          value={selectedRatings}
          sx={{
            "& .MuiSelect-icon": {
              color: "#ffffff",
            },
          }}
          slotProps={{
            select: {
              multiple: true,
              renderValue: (selected: unknown) => {
                const values = selected as SessionPageRating[];
                if (!values.length) {
                  return "All difficulties";
                }
                return values.map((rating) => ratingLabels[rating]).join(", ");
              },
            },
          }}
          onChange={(event) => {
            const value = event.target.value;
            setSelectedRatings(
              typeof value === "string"
                ? (value.split(",") as SessionPageRating[])
                : (value as SessionPageRating[])
            );
          }}
        >
          {ratingOptions.map((rating) => (
            <MenuItem key={rating} value={rating}>
              <Checkbox
                checked={selectedRatings.includes(rating)}
                sx={{
                  color: "#ffffff",
                  "&.Mui-checked": {
                    color: "#ffffff",
                  },
                }}
              />
              <ListItemText primary={ratingLabels[rating]} />
            </MenuItem>
          ))}
        </TextField>
      </div>

      {!filteredCards.length ? (
        <Card
          className="rounded-2xl border border-white/10 bg-transparent p-6 text-center shadow-sm"
          sx={{ backgroundColor: "transparent !important" }}
        >
          <p className="text-sm text-white">No cards match your current filters.</p>
        </Card>
      ) : null}

      {filteredCards.map((card) => (
        <Card
          key={card.id}
          className="rounded-2xl border border-white/10 bg-transparent p-4 shadow-sm"
          sx={{ backgroundColor: "transparent !important" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">{card.question}</p>
            <Chip
              label={ratingLabels[toSessionPageRating(card.sessionRating)]}
              size="small"
              sx={{
                borderRadius: "9999px",
                fontWeight: 700,
                bgcolor: ratingStyle[card.sessionRating].bg,
                color: ratingStyle[card.sessionRating].color,
                border: "1px solid rgba(255, 255, 255, 0.1)",
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