import { prisma } from "@/lib/prisma";
import type { CardWithSM2 } from "@/types/card";
import type { DeckSummary, DeckWithStats, TopicStat } from "@/types/deck";

function toPercent(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

export async function getUserDecks(userId: string): Promise<DeckSummary[]> {
  const now = new Date();

  const decks = await prisma.deck.findMany({
    where: {
      userId,
      archived: false,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastStudied: true,
    },
    orderBy: [
      {
        lastStudied: {
          sort: "desc",
          nulls: "last",
        },
      },
      {
        createdAt: "desc",
      },
    ],
  });

  if (decks.length === 0) {
    return [];
  }

  const deckIds = decks.map((deck) => deck.id);

  const [totalByDeck, dueByDeck, masteredByDeck, latestReviews] = await Promise.all([
    prisma.card.groupBy({
      by: ["deckId"],
      where: {
        deckId: { in: deckIds },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.card.groupBy({
      by: ["deckId"],
      where: {
        deckId: { in: deckIds },
        OR: [{ nextReviewDate: { lte: now } }, { isNew: true }],
      },
      _count: {
        _all: true,
      },
    }),
    prisma.card.groupBy({
      by: ["deckId"],
      where: {
        deckId: { in: deckIds },
        isNew: false,
        easeFactor: { gte: 2.0 },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.review.findMany({
      where: {
        userId,
        card: {
          deckId: { in: deckIds },
        },
      },
      orderBy: {
        reviewedAt: "desc",
      },
      select: {
        reviewedAt: true,
        card: {
          select: {
            deckId: true,
          },
        },
      },
    }),
  ]);

  const totalMap = new Map(totalByDeck.map((item) => [item.deckId, item._count._all]));
  const dueMap = new Map(dueByDeck.map((item) => [item.deckId, item._count._all]));
  const masteredMap = new Map(
    masteredByDeck.map((item) => [item.deckId, item._count._all])
  );
  const latestReviewMap = new Map<string, Date>();

  for (const review of latestReviews) {
    if (!latestReviewMap.has(review.card.deckId)) {
      latestReviewMap.set(review.card.deckId, review.reviewedAt);
    }
  }

  return decks.map((deck) => {
    const cardCount = totalMap.get(deck.id) ?? 0;
    const dueToday = dueMap.get(deck.id) ?? 0;
    const mastered = masteredMap.get(deck.id) ?? 0;
    const masteryPercent = cardCount > 0 && dueToday === 0 ? 100 : toPercent(mastered, cardCount);

    return {
      id: deck.id,
      name: deck.name,
      cardCount,
      dueToday,
      masteryPercent,
      lastStudied: deck.lastStudied ?? latestReviewMap.get(deck.id) ?? null,
      createdAt: deck.createdAt,
    };
  });
}

export async function getDeckById(
  deckId: string,
  userId: string
): Promise<DeckWithStats | null> {
  const now = new Date();

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    select: {
      id: true,
      name: true,
      userId: true,
      archived: true,
      lastStudied: true,
    },
  });

  if (!deck) {
    return null;
  }

  const [
    cardCount,
    dueToday,
    newCount,
    masteredCount,
    topicTotals,
    topicMastered,
    latestReview,
  ] =
    await Promise.all([
      prisma.card.count({
        where: { deckId: deck.id },
      }),
      prisma.card.count({
        where: {
          deckId: deck.id,
          OR: [{ nextReviewDate: { lte: now } }, { isNew: true }],
        },
      }),
      prisma.card.count({
        where: {
          deckId: deck.id,
          isNew: true,
        },
      }),
      prisma.card.count({
        where: {
          deckId: deck.id,
          isNew: false,
          easeFactor: { gte: 2.0 },
        },
      }),
      prisma.card.groupBy({
        by: ["topicTag"],
        where: {
          deckId: deck.id,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.card.groupBy({
        by: ["topicTag"],
        where: {
          deckId: deck.id,
          isNew: false,
          easeFactor: { gte: 2.0 },
        },
        _count: {
          _all: true,
        },
      }),
      prisma.review.findFirst({
        where: {
          userId,
          card: {
            deckId: deck.id,
          },
        },
        orderBy: {
          reviewedAt: "desc",
        },
        select: {
          reviewedAt: true,
        },
      }),
    ]);

  const masteredByTopic = new Map(
    topicMastered.map((row) => [row.topicTag ?? "Untagged", row._count._all])
  );

  const topics: TopicStat[] = topicTotals.map((row) => {
    const topicTag = row.topicTag ?? "Untagged";
    const total = row._count._all;
    const mastered = masteredByTopic.get(topicTag) ?? 0;

    return {
      topicTag,
      total,
      mastered,
      masteryPercent: toPercent(mastered, total),
    };
  });

  return {
    id: deck.id,
    name: deck.name,
    userId: deck.userId,
    archived: deck.archived,
    cardCount,
    dueToday,
    newCount,
    masteryPercent:
      cardCount > 0 && dueToday === 0 ? 100 : toPercent(masteredCount, cardCount),
    lastStudied: deck.lastStudied ?? latestReview?.reviewedAt ?? null,
    topics,
  };
}

export async function createDeck(
  userId: string,
  name: string
): Promise<{ id: string }> {
  const deck = await prisma.deck.create({
    data: {
      userId,
      name,
      archived: false,
    },
    select: {
      id: true,
    },
  });

  return { id: deck.id };
}

export async function renameDeck(
  deckId: string,
  userId: string,
  name: string
): Promise<void> {
  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 100) {
    throw new Error("Name must be between 1 and 100 characters");
  }

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

  await prisma.deck.update({
    where: {
      id: deck.id,
    },
    data: {
      name: trimmedName,
    },
  });
}

export async function archiveDeck(deckId: string, userId: string): Promise<void> {
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

  await prisma.deck.update({
    where: {
      id: deck.id,
    },
    data: {
      archived: true,
    },
  });
}

export async function getWeakSpots(
  userId: string,
  limit = 5
): Promise<CardWithSM2[]> {
  const cards = await prisma.card.findMany({
    where: {
      isNew: false,
      deck: {
        userId,
        archived: false,
      },
    },
    orderBy: [{ easeFactor: "asc" }, { repetitions: "desc" }],
    take: limit,
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
