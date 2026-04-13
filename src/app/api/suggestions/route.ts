import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { generateCardSuggestions } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	const body = await req.json().catch(() => null) as { deckId?: unknown } | null;
	const deckId = typeof body?.deckId === "string" ? body.deckId : "";
	if (!deckId) return apiError("deckId is required", 400);

	try {
		const deck = await prisma.deck.findFirst({ where: { id: deckId, userId }, select: { id: true } });
		if (!deck) return apiError("Deck not found", 404);

		const weakCards = await prisma.card.findMany({
			where: { deckId, isNew: false },
			orderBy: { easeFactor: "asc" },
			take: 5,
			select: { question: true, answer: true, topicTag: true },
		});
		if (weakCards.length === 0) return apiSuccess({ suggestions: [], reason: "no_reviewed_cards" });

		const existing = await prisma.card.findMany({ where: { deckId }, select: { question: true } });
		const existingQuestions = existing.map((c) => c.question);
		const suggestions = await generateCardSuggestions(weakCards, existingQuestions);
		return apiSuccess({ suggestions });
	} catch {
		return apiError("Could not generate suggestions", 503);
	}
}
