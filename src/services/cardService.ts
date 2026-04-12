import { prisma } from "@/lib/prisma";
import { daysFromNow } from "@/lib/utils";
import type { CardWithSM2, RawCard } from "@/types/card";

async function assertDeckOwnership(deckId: string, userId: string): Promise<void> {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!deck) {
    throw new Error("Not found");
  }
}

export async function getCardsForDeck(
  deckId: string,
  userId: string,
  options?: { topics?: string[]; topic?: string; search?: string }
): Promise<CardWithSM2[]> {
  await assertDeckOwnership(deckId, userId);

  const topics = (options?.topics ?? [])
    .map((topic) => topic.trim())
    .filter(Boolean);
  const topic = options?.topic?.trim();
  const search = options?.search?.trim();

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      ...(topics.length > 0
        ? {
            topicTag: { in: topics },
          }
        : topic
        ? {
            topicTag: topic,
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                question: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                answer: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ isNew: "desc" }, { createdAt: "asc" }],
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

  return cards;
}

export async function createCard(
  deckId: string,
  userId: string,
  data: { question: string; answer: string; topicTag?: string }
): Promise<CardWithSM2> {
  await assertDeckOwnership(deckId, userId);

  const question = data.question.trim();
  const answer = data.answer.trim();

  if (!question) {
    throw new Error("Question is required");
  }

  if (!answer) {
    throw new Error("Answer is required");
  }

  const topicTag = data.topicTag?.trim();

  const card = await prisma.card.create({
    data: {
      deckId,
      question,
      answer,
      topicTag: topicTag || null,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      isNew: true,
      nextReviewDate: daysFromNow(1),
    },
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

  return card;
}

export async function updateCard(
  cardId: string,
  userId: string,
  data: { question?: string; answer?: string; topicTag?: string | null }
): Promise<CardWithSM2> {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
    },
    select: {
      id: true,
      deck: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!card || card.deck.userId !== userId) {
    throw new Error("Not found");
  }

  const updateData: {
    question?: string;
    answer?: string;
    topicTag?: string | null;
  } = {};

  if (data.question !== undefined) {
    const question = data.question.trim();
    if (!question) {
      throw new Error("Question is required");
    }
    updateData.question = question;
  }

  if (data.answer !== undefined) {
    const answer = data.answer.trim();
    if (!answer) {
      throw new Error("Answer is required");
    }
    updateData.answer = answer;
  }

  if (data.topicTag !== undefined) {
    if (data.topicTag === null) {
      updateData.topicTag = null;
    } else {
      const topicTag = data.topicTag.trim();
      updateData.topicTag = topicTag || null;
    }
  }

  const updated = await prisma.card.update({
    where: {
      id: card.id,
    },
    data: updateData,
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

  return updated;
}

export async function deleteCard(cardId: string, userId: string): Promise<void> {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
    },
    select: {
      id: true,
      deck: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!card || card.deck.userId !== userId) {
    throw new Error("Not found");
  }

  await prisma.card.delete({
    where: {
      id: card.id,
    },
  });
}

export async function bulkCreateCards(
  deckId: string,
  cards: RawCard[]
): Promise<number> {
  if (cards.length === 0) {
    return 0;
  }

  const nextReviewDate = daysFromNow(1);

  const result = await prisma.card.createMany({
    data: cards.map((card) => ({
      deckId,
      question: card.question,
      answer: card.answer,
      topicTag: card.topicTag,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      isNew: true,
      nextReviewDate,
    })),
  });

  return result.count;
}
