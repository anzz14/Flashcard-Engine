import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { deleteCard, updateCard } from "@/services/cardService";

type Props = { params: Promise<{ deckId: string; cardId: string }> };

export async function PATCH(req: Request, { params }: Props) {
	const { cardId } = await params;
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		const { question, answer, topicTag } = await req.json();
		if (question !== undefined && (typeof question !== "string" || question.trim().length < 1)) {
			return apiError("Question must be non-empty", 400);
		}

		const card = await updateCard(cardId, userId, { question, answer, topicTag });
		return apiSuccess(card);
	} catch {
		return apiError("Card not found", 404);
	}
}

export async function DELETE(_: Request, { params }: Props) {
	const { cardId } = await params;
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		await deleteCard(cardId, userId);
		return apiSuccess({ success: true });
	} catch {
		return apiError("Card not found", 404);
	}
}
