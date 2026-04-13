"use client";

import Button from "@mui/material/Button";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { getNextReviewPreview } from "@/lib/sm2";
import type { CardWithSM2, ReviewRating } from "@/types/card";

type RatingButtonsProps = {
  card: CardWithSM2;
  onRate: (rating: ReviewRating) => void;
  isSubmitting: boolean;
};

type RatingConfig = {
  label: string;
  rating: ReviewRating;
  keyLabel: string;
  background: string;
  hover: string;
};

const ratings: RatingConfig[] = [
  {
    label: "Again",
    rating: "AGAIN",
    keyLabel: "1",
    background: "#7f1d1d",
    hover: "#5f1515",
  },
  {
    label: "Hard",
    rating: "HARD",
    keyLabel: "2",
    background: "#ef4444",
    hover: "#dc2626",
  },
  {
    label: "Medium",
    rating: "GOOD",
    keyLabel: "3",
    background: "#eab308",
    hover: "#ca8a04",
  },
  {
    label: "Easy",
    rating: "EASY",
    keyLabel: "4",
    background: "#16a34a",
    hover: "#15803d",
  },
];

export default function RatingButtons({ card, onRate, isSubmitting }: RatingButtonsProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isSubmitting) {
        return;
      }

      const hit = ratings.find((option) => option.keyLabel === event.key);
      if (!hit) {
        return;
      }

      event.preventDefault();
      onRate(hit.rating);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSubmitting, onRate]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {ratings.map((option) => (
        <div key={option.rating} className="space-y-2">
          <div className="relative">
            <Button
              fullWidth
              disabled={isSubmitting}
              onClick={() => onRate(option.rating)}
              sx={{
                textTransform: "none",
                borderRadius: "0.75rem",
                py: 1.1,
                fontWeight: option.rating === "AGAIN" ? 800 : 700,
                color: "#ffffff",
                backgroundColor: option.background,
                "&:hover": {
                  backgroundColor: option.hover,
                },
                "&.Mui-disabled": {
                  color: "#ffffff",
                  backgroundColor: option.background,
                  opacity: 0.65,
                },
              }}
            >
              {isSubmitting ? <Spinner size="sm" className="text-white" /> : option.label}
            </Button>

            <span className="absolute -right-2 -top-2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-700">
              {option.keyLabel}
            </span>
          </div>

          <p className="text-center text-xs text-slate-500">
            {getNextReviewPreview(card, option.rating)}
          </p>
        </div>
      ))}
    </div>
  );
}
