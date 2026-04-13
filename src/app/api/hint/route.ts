import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { generateHintForCard } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	const body = await req.json().catch(() => null) as
		| { question?: unknown; answer?: unknown; cardId?: unknown }
		| null;
	if (!body) return apiError("Invalid body", 400);
	const { question, answer, cardId } = body;
	if (typeof question !== "string" || question.trim().length < 1) return apiError("question is required", 400);
	if (typeof answer !== "string" || answer.trim().length < 1) return apiError("answer is required", 400);
	if (typeof cardId !== "string") return apiError("cardId is required", 400);

	const card = await prisma.card.findFirst({
		where: { id: cardId },
		include: { deck: { select: { userId: true } } },
	});
	if (!card || card.deck.userId !== userId) return apiError("Card not found", 404);

	try {
		const hint = await generateHintForCard(question, answer);
		return apiSuccess({ hint });
	} catch {
		return apiError("Could not generate hint. Try again.", 503);
	}
}
