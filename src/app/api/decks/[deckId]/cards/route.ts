import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { createCard, getCardsForDeck } from "@/services/cardService";

type Props = { params: Promise<{ deckId: string }> };

export async function GET(req: Request, { params }: Props) {
	const { deckId } = await params;
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		const { searchParams } = new URL(req.url);
		const topics = searchParams
			.getAll("topic")
			.map((topic) => topic.trim())
			.filter(Boolean);
		const topic = searchParams.get("topic") ?? undefined;
		const search = searchParams.get("search") ?? undefined;
		const cards = await getCardsForDeck(deckId, userId, {
			topics: topics.length > 0 ? topics : undefined,
			topic,
			search,
		});
		return apiSuccess(cards);
	} catch {
		return apiError("Failed to fetch cards", 500);
	}
}

export async function POST(req: Request, { params }: Props) {
	const { deckId } = await params;
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	try {
		const { question, answer, topicTag } = await req.json();
		if (
			typeof question !== "string" ||
			question.trim().length < 1 ||
			typeof answer !== "string" ||
			answer.trim().length < 1
		) {
			return apiError("Question and answer are required", 400);
		}

		const card = await createCard(deckId, userId, { question, answer, topicTag });
		return apiSuccess(card, 201);
	} catch {
		return apiError("Failed to create card", 500);
	}
}
