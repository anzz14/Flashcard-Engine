import { applyRating } from "@/lib/sm2";
import { prisma } from "@/lib/prisma";
import type { ReviewRating, SM2Update } from "@/types/card";

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
    prisma.review.create({
      data: { cardId, userId, rating },
    }),
  ]);

  return updates;
}
