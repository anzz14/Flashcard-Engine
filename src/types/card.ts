export type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface CardWithSM2 {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  topicTag: string | null;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
  isNew: boolean;
}

export interface SM2Update {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
  isNew: false;
}

export interface RawCard {
  question: string;
  answer: string;
  topicTag: string;
}
