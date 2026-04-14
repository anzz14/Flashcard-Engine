import { applyRating } from "@/lib/sm2";
import { prisma } from "@/lib/prisma";
import type { CardWithSM2, ReviewRating, SM2Update } from "@/types/card";

export type LastSessionCard = CardWithSM2 & { sessionRating: ReviewRating };

export async function applyReview(
  cardId: string,
  userId: string,
  rating: ReviewRating
): Promise<SM2Update> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { deck: { select: { userId: true } } },
  });

  if (!card || card.deck.userId !== userId) {
    throw new Error("Card not found");
  }

  const updates = applyRating(card, rating);
  const reviewedAt = new Date();

  await prisma.$transaction([
    prisma.card.update({
      where: { id: cardId },
      data: {
        interval: updates.interval,
        easeFactor: updates.easeFactor,
        repetitions: updates.repetitions,
        nextReviewDate: updates.nextReviewDate,
        isNew: false,
      },
    }),
    prisma.deck.update({
      where: { id: card.deckId },
      data: { lastStudied: reviewedAt },
    }),
    prisma.review.create({
      data: { cardId, userId, rating, reviewedAt },
    }),
  ]);

  return updates;
}

export async function getLastSession(
  deckId: string,
  userId: string
): Promise<{
  sessionDate: string | null;
  cards: LastSessionCard[];
}> {
  const latestReview = await prisma.review.findFirst({
    where: { userId, card: { deckId } },
    orderBy: { reviewedAt: "desc" },
    select: { reviewedAt: true },
  });

  if (!latestReview) {
    return { sessionDate: null, cards: [] };
  }

  const reviewedAt = latestReview.reviewedAt;
  const dayStart = new Date(
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
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const reviews = await prisma.review.findMany({
    where: {
      userId,
      card: { deckId },
      reviewedAt: { gte: dayStart, lt: dayEnd },
    },
    orderBy: { reviewedAt: "desc" },
    select: {
      rating: true,
      reviewedAt: true,
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

  const deduplicated = new Map<string, LastSessionCard>();

  for (const review of reviews) {
    if (deduplicated.has(review.card.id)) {
      continue;
    }

    deduplicated.set(review.card.id, {
      ...review.card,
      sessionRating: review.rating,
    });
  }

  return {
    sessionDate: dayStart.toISOString().slice(0, 10),
    cards: Array.from(deduplicated.values()),
  };
}
