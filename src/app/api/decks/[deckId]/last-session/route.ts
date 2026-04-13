import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { getLastSession } from "@/services/reviewService";

type Props = { params: Promise<{ deckId: string }> };

export async function GET(_: Request, { params }: Props) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	const { deckId } = await params;

	try {
		const session = await getLastSession(deckId, userId);
		return apiSuccess(session);
	} catch {
		return apiError("Failed to fetch last session", 500);
	}
}