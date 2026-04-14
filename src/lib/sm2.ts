import type { CardWithSM2, ReviewRating, SM2Update } from "../types/card";
import { daysFromNow } from "./utils";

export function applyRating(
  card: Pick<CardWithSM2, "interval" | "easeFactor" | "repetitions">,
  rating: ReviewRating
): SM2Update {
  let { interval, easeFactor, repetitions } = card;

  switch (rating) {
    case "AGAIN":
      interval = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      repetitions = 0;
      break;
    case "HARD":
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions = repetitions + 1;
      break;
    case "GOOD":
      interval = 3;
      repetitions = repetitions + 1;
      break;
    case "EASY":
      interval = 7;
      easeFactor = Math.min(3.0, easeFactor + 0.1);
      repetitions = repetitions + 1;
      break;
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextReviewDate: daysFromNow(interval),
    isNew: false,
  };
}

export function getNextReviewPreview(
  card: Pick<CardWithSM2, "interval" | "easeFactor" | "repetitions">,
  rating: ReviewRating
): string {
  if (rating === "AGAIN") {
    return "at end of deck";
  }

  if (rating === "HARD") {
    return "in 1 day";
  }

  if (rating === "GOOD") {
    return "in 3 days";
  }

  return "in 7 days";
}
