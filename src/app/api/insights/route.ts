import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { prisma } from "@/lib/prisma";

type ReviewRow = {
	rating: "AGAIN" | "HARD" | "GOOD" | "EASY";
	reviewedAt: Date;
	card: { topicTag: string | null; easeFactor: number; interval: number; deckId: string };
};

const dayKey = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export async function GET() {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const reviews = (await prisma.review.findMany({
			where: { userId, reviewedAt: { gte: thirtyDaysAgo } },
			select: {
				rating: true,
				reviewedAt: true,
				card: { select: { topicTag: true, easeFactor: true, interval: true, deckId: true } },
			},
			orderBy: { reviewedAt: "asc" },
		})) as ReviewRow[];

		const goodOrEasy = (rating: ReviewRow["rating"]) => rating === "GOOD" || rating === "EASY";
		const isSameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
		const today = new Date();
		const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		const hourMap = new Map<number, number>();
		const topicMap = new Map<string, { goodEasy: number; total: number }>();
		const thisWeekDays = new Set<string>();
		const lastWeekDays = new Set<string>();
		const dailyMap = new Map<string, number>();

		for (let i = 13; i >= 0; i -= 1) {
			const date = new Date(startOfToday);
			date.setDate(date.getDate() - i);
			dailyMap.set(dayKey(date), 0);
		}

		for (const review of reviews) {
			const hour = review.reviewedAt.getHours();
			const topic = review.card.topicTag?.trim() || "General";
			const reviewDay = new Date(review.reviewedAt.getFullYear(), review.reviewedAt.getMonth(), review.reviewedAt.getDate());
			const diffDays = Math.floor((startOfToday.getTime() - reviewDay.getTime()) / (24 * 60 * 60 * 1000));

			hourMap.set(hour, (hourMap.get(hour) ?? 0) + (goodOrEasy(review.rating) ? 1 : 0));

			const topicEntry = topicMap.get(topic) ?? { goodEasy: 0, total: 0 };
			topicEntry.total += 1;
			if (goodOrEasy(review.rating)) topicEntry.goodEasy += 1;
			topicMap.set(topic, topicEntry);

			if (diffDays >= 0 && diffDays <= 6) thisWeekDays.add(dayKey(reviewDay));
			if (diffDays >= 7 && diffDays <= 13) lastWeekDays.add(dayKey(reviewDay));

			if (dailyMap.has(dayKey(reviewDay))) {
				dailyMap.set(dayKey(reviewDay), (dailyMap.get(dayKey(reviewDay)) ?? 0) + 1);
			}
		}

		let bestStudyHour: number | null = null;
		let bestHourScore = -1;
		for (const [hour, score] of hourMap.entries()) {
			if (score > bestHourScore) {
				bestHourScore = score;
				bestStudyHour = hour;
			}
		}
		if (reviews.length === 0) bestStudyHour = null;

		const topicRetention = [...topicMap.entries()]
			.filter(([, value]) => value.total >= 3)
			.map(([topicTag, value]) => ({
				topicTag,
				retentionRate: Math.round((value.goodEasy / value.total) * 100),
			}))
			.sort((a, b) => a.retentionRate - b.retentionRate)
			.slice(0, 6);

		const dailyVolume = [...dailyMap.entries()].map(([key, count]) => {
			const [year, month, day] = key.split("-").map(Number);
			const date = new Date(year, month - 1, day);
			return {
				date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
				count,
			};
		});

		return apiSuccess({
			bestStudyHour,
			topicRetention,
			studyStreak: {
				thisWeek: thisWeekDays.size,
				lastWeek: lastWeekDays.size,
			},
			dailyVolume,
			totalReviews: reviews.length,
		});
	} catch {
		return apiError("Failed to load insights", 500);
	}
}
