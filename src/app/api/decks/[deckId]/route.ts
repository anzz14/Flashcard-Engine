import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import {
	archiveDeck,
	getDeckById,
	renameDeck,
} from "@/services/deckService";

type Props = { params: Promise<{ deckId: string }> };

export async function GET(_: Request, { params }: Props) {
	const { deckId } = await params;
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		const deck = await getDeckById(deckId, userId);
		if (!deck || deck.archived) return apiError("Deck not found", 404);
		return apiSuccess(deck);
	} catch {
		return apiError("Failed to fetch deck", 500);
	}
}

export async function PATCH(req: Request, { params }: Props) {
	const { deckId } = await params;
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		const { name, archived } = await req.json();
		if (typeof name === "string") {
			await renameDeck(deckId, userId, name);
		}
		if (archived === true) {
			await archiveDeck(deckId, userId);
		}
		return apiSuccess({ success: true });
	} catch {
		return apiError("Deck not found", 404);
	}
}

export async function DELETE(_: Request, { params }: Props) {
	const { deckId } = await params;
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		await archiveDeck(deckId, userId);
		return apiSuccess({ success: true });
	} catch {
		return apiError("Deck not found", 404);
	}
}
