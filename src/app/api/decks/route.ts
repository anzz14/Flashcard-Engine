import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { createDeck, getUserDecks } from "@/services/deckService";

export async function GET() {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;
	try {
		const decks = await getUserDecks(userId);
		return apiSuccess(decks);
	} catch {
		return apiError("Failed to fetch decks", 500);
	}
}

export async function POST(req: Request) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;
	try {
		const { name } = await req.json();
		if (!name || name.trim().length < 1) return apiError("Name is required", 400);
		const deck = await createDeck(userId, name.trim());
		return apiSuccess({ id: deck.id }, 201);
	} catch {
		return apiError("Failed to create deck", 500);
	}
}
