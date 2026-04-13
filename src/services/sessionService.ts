import { prisma } from "@/lib/prisma";
import type { CardWithSM2, ReviewRating } from "@/types/card";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function buildSessionQueue(
  deckId: string,
  userId: string,
  options?: { topic?: string }
): Promise<{
  cards: CardWithSM2[];
  totalNew: number;
  totalDue: number;
  nextDueDate: Date | null;
}> {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) {
    throw new Error("Deck not found");
  }

  const baseWhere = {
    deckId,
    ...(options?.topic ? { topicTag: options.topic } : {}),
  };

  const newCards = await prisma.card.findMany({
    where: { ...baseWhere, isNew: true },
    orderBy: { createdAt: "asc" },
    take: 10,
    select: {
      id: true,
      deckId: true,
      question: true,
      answer: true,
      topicTag: true,
      interval: true,
      easeFactor: true,
      repetitions: true,
      nextReviewDate: true,
      isNew: true,
    },
  });

  const dueCards = await prisma.card.findMany({
    where: {
      ...baseWhere,
      isNew: false,
      nextReviewDate: { lte: new Date() },
    },
    orderBy: { easeFactor: "asc" },
    take: 10,
    select: {
      id: true,
      deckId: true,
      question: true,
      answer: true,
      topicTag: true,
      interval: true,
      easeFactor: true,
      repetitions: true,
      nextReviewDate: true,
      isNew: true,
    },
  });

  const nextUpcoming = await prisma.card.findFirst({
    where: {
      ...baseWhere,
      isNew: false,
      nextReviewDate: { gt: new Date() },
    },
    orderBy: { nextReviewDate: "asc" },
    select: { nextReviewDate: true },
  });

  return {
    cards: [...shuffle(newCards), ...shuffle(dueCards)],
    totalNew: newCards.length,
    totalDue: dueCards.length,
    nextDueDate: nextUpcoming?.nextReviewDate ?? null,
  };
}

export type LastSessionCard = CardWithSM2 & {
  sessionRating: ReviewRating;
};

export async function getLastSession(
  deckId: string,
  userId: string
): Promise<{ sessionDate: string | null; cards: LastSessionCard[] }> {
  const latestReview = await prisma.review.findFirst({
    where: {
      userId,
      card: {
        deckId,
      },
    },
    orderBy: {
      reviewedAt: "desc",
    },
    select: {
      reviewedAt: true,
    },
  });

  if (!latestReview) {
    return {
      sessionDate: null,
      cards: [],
    };
  }

  const reviewedAt = latestReview.reviewedAt;
  const sessionStart = new Date(
    Date.UTC(
      reviewedAt.getUTCFullYear(),
      reviewedAt.getUTCMonth(),
      reviewedAt.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const sessionEnd = new Date(sessionStart);
  sessionEnd.setUTCDate(sessionEnd.getUTCDate() + 1);

  const sameDayReviews = await prisma.review.findMany({
    where: {
      userId,
      reviewedAt: {
        gte: sessionStart,
        lt: sessionEnd,
      },
      card: {
        deckId,
      },
    },
    orderBy: {
      reviewedAt: "desc",
    },
    select: {
      rating: true,
      card: {
        select: {
          id: true,
          deckId: true,
          question: true,
          answer: true,
          topicTag: true,
          interval: true,
          easeFactor: true,
          repetitions: true,
          nextReviewDate: true,
          isNew: true,
        },
      },
    },
  });

  const latestByCard = new Map<string, LastSessionCard>();

  for (const review of sameDayReviews) {
    if (latestByCard.has(review.card.id)) {
      continue;
    }

    latestByCard.set(review.card.id, {
      ...review.card,
      sessionRating: review.rating,
    });
  }

  return {
    sessionDate: sessionStart.toISOString().slice(0, 10),
    cards: Array.from(latestByCard.values()),
  };
}
