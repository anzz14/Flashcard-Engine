import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { updateStreak } from "@/services/progressService";
import { applyReview } from "@/services/reviewService";
import type { ReviewRating } from "@/types/card";

const VALID_RATINGS: ReviewRating[] = ["AGAIN", "HARD", "GOOD", "EASY"];

export async function POST(req: Request) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		const { cardId, rating } = await req.json();

		if (typeof cardId !== "string" || !VALID_RATINGS.includes(rating as ReviewRating)) {
			return apiError("Invalid cardId or rating", 400);
		}

		const updatedSM2 = await applyReview(cardId, userId, rating as ReviewRating);
		const updatedStreak = await updateStreak(userId);

		return apiSuccess({
			sm2: updatedSM2,
			streak: updatedStreak,
		});
	} catch (e) {
		if (e instanceof Error && e.message === "Card not found") {
			return apiError("Card not found", 404);
		}
		return apiError("Failed to apply review", 500);
	}
}
