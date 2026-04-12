import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { buildSessionQueue } from "@/services/sessionService";

type Props = { params: Promise<{ deckId: string }> };

export async function GET(req: Request, { params }: Props) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	const { deckId } = await params;
	const { searchParams } = new URL(req.url);
	const topic = searchParams.get("topic") ?? undefined;

	try {
		const session = await buildSessionQueue(deckId, userId, { topic });
		return apiSuccess({
			cards: session.cards,
			totalNew: session.totalNew,
			totalDue: session.totalDue,
			totalCards: session.cards.length,
		});
	} catch (e) {
		if (e instanceof Error && e.message === "Deck not found") {
			return apiError("Deck not found", 404);
		}
		return apiError("Failed to build session", 500);
	}
}
