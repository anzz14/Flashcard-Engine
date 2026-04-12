import type { CardWithSM2, ReviewRating, SM2Update } from "../types/card";
import { daysFromNow, pluralize } from "./utils";

export function applyRating(
  card: Pick<CardWithSM2, "interval" | "easeFactor" | "repetitions">,
  rating: ReviewRating
): SM2Update {
  let { interval, easeFactor, repetitions } = card;

  switch (rating) {
    case "AGAIN":
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      repetitions = 0;
      break;
    case "HARD":
      interval = Math.round(Math.max(1, interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions = repetitions + 1;
      break;
    case "GOOD":
      // First review: 1 day. Subsequent: interval × easeFactor
      interval = repetitions === 0 ? 1 : Math.round(interval * easeFactor);
      repetitions = repetitions + 1;
      break;
    case "EASY":
      interval = Math.round(interval * easeFactor * 1.3);
      easeFactor = Math.min(3.0, easeFactor + 0.1);
      repetitions = repetitions + 1;
      break;
  }

  // Minimum interval: always at least 1 day
  interval = Math.max(1, interval);

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
  const { interval } = applyRating(card, rating);

  if (interval >= 7 && interval % 7 === 0) {
    const weeks = interval / 7;
    return `in ${pluralize(weeks, "week")}`;
  }

  return `in ${pluralize(interval, "day")}`;
}
