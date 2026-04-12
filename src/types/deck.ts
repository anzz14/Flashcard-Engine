export interface DeckSummary {
  id: string;
  name: string;
  cardCount: number;
  dueToday: number;
  masteryPercent: number;
  lastStudied: Date | null;
  createdAt: Date;
}

export interface TopicStat {
  topicTag: string;
  total: number;
  mastered: number; // easeFactor >= 2.0
  masteryPercent: number;
}

export interface DeckWithStats {
  id: string;
  name: string;
  userId: string;
  archived: boolean;
  cardCount: number;
  dueToday: number;
  newCount: number;
  masteryPercent: number;
  lastStudied: Date | null;
  topics: TopicStat[];
}
