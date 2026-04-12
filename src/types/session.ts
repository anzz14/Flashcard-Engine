import { CardWithSM2, ReviewRating } from "./card";

export interface StudySessionState {
  cards: CardWithSM2[];
  currentIndex: number;
  isFlipped: boolean;
  ratings: Record<string, ReviewRating>;
  status: "active" | "complete" | "empty";
}

export interface SessionSummaryData {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  masteredToday: number;
  streakUpdated: boolean;
  newStreak: number;
}
