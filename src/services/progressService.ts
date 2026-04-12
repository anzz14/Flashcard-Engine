import { prisma } from "@/lib/prisma";
import type { TopicStat } from "@/types/deck";
import type { UserStreak } from "@/types/user";

export async function updateStreak(userId: string): Promise<UserStreak> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakCurrent: true,
      streakLongest: true,
      lastStudiedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  function isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(todayMidnight.getDate() - 1);

  if (user.lastStudiedAt && isSameDay(user.lastStudiedAt, todayMidnight)) {
    return {
      streakCurrent: user.streakCurrent,
      streakLongest: user.streakLongest,
      lastStudiedAt: user.lastStudiedAt,
    };
  }

  let nextStreakCurrent = 1;
  if (user.lastStudiedAt && isSameDay(user.lastStudiedAt, yesterdayMidnight)) {
    nextStreakCurrent = user.streakCurrent + 1;
  }

  const nextStreakLongest = Math.max(user.streakLongest, nextStreakCurrent);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      streakCurrent: nextStreakCurrent,
      streakLongest: nextStreakLongest,
      lastStudiedAt: now,
    },
    select: {
      streakCurrent: true,
      streakLongest: true,
      lastStudiedAt: true,
    },
  });

  return {
    streakCurrent: updated.streakCurrent,
    streakLongest: updated.streakLongest,
    lastStudiedAt: updated.lastStudiedAt,
  };
}

export async function getDeckTopicStats(deckId: string): Promise<TopicStat[]> {
  const [topicTotals, topicMastered] = await Promise.all([
    prisma.card.groupBy({
      by: ["topicTag"],
      where: { deckId },
      _count: { id: true },
    }),
    prisma.card.groupBy({
      by: ["topicTag"],
      where: {
        deckId,
        isNew: false,
        easeFactor: { gte: 2.0 },
      },
      _count: { id: true },
    }),
  ]);

  const masteredMap = new Map(
    topicMastered.map((row) => [row.topicTag ?? "Untagged", row._count.id])
  );

  const topics: TopicStat[] = topicTotals.map((row) => {
    const topicTag = row.topicTag ?? "Untagged";
    const total = row._count.id;
    const mastered = masteredMap.get(topicTag) ?? 0;
    const masteryPercent = total === 0 ? 0 : Math.round((mastered / total) * 100);

    return {
      topicTag,
      total,
      mastered,
      masteryPercent,
    };
  });

  topics.sort((a, b) => a.topicTag.localeCompare(b.topicTag));
  return topics;
}

export async function getUserStats(userId: string): Promise<{
  totalDecks: number;
  totalCards: number;
  totalDueToday: number;
  streak: UserStreak;
}> {
  const now = new Date();

  const [totalDecks, totalCards, totalDueToday, user] = await Promise.all([
    prisma.deck.count({
      where: {
        userId,
        archived: false,
      },
    }),
    prisma.card.count({
      where: {
        deck: {
          userId,
          archived: false,
        },
      },
    }),
    prisma.card.count({
      where: {
        deck: {
          userId,
          archived: false,
        },
        OR: [{ nextReviewDate: { lte: now } }, { isNew: true }],
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        streakCurrent: true,
        streakLongest: true,
        lastStudiedAt: true,
      },
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    totalDecks,
    totalCards,
    totalDueToday,
    streak: {
      streakCurrent: user.streakCurrent,
      streakLongest: user.streakLongest,
      lastStudiedAt: user.lastStudiedAt,
    },
  };
}
