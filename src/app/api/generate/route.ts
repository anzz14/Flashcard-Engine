import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { PDFExtractionError, extractTextFromPDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import { generateCardsForDeck } from "@/services/generateCards";

export async function POST(req: Request) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	const formData = await req.formData();
	const deckIdValue = formData.get("deckId");
	const fileValue = formData.get("file");
	const textValue = formData.get("text");

	const deckId = typeof deckIdValue === "string" ? deckIdValue : "";
	const file = fileValue instanceof File ? fileValue : null;
	const text = typeof textValue === "string" ? textValue : null;

	if (!deckId) {
		return apiError("deckId is required", 400);
	}

	if (!file && !text) {
		return apiError("Either file or text is required", 400);
	}

	const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
	if (!deck) {
		return apiError("Deck not found", 404);
	}

	let extractedText: string;

	if (file) {
		const buffer = Buffer.from(await file.arrayBuffer());
		try {
			extractedText = await extractTextFromPDF(buffer);
		} catch (e) {
			if (e instanceof PDFExtractionError) {
				return apiError(e.message, 422);
			}
			return apiError("Failed to process PDF", 500);
		}
	} else if (text) {
		if (text.trim().split(/\s+/).length < 100) {
			return apiError("Text is too short. Please provide at least 100 words.", 422);
		}
		extractedText = text;
	} else {
		return apiError("No content provided", 400);
	}

	generateCardsForDeck(deckId, extractedText).catch((err) => {
		console.error("Generation pipeline error:", err);
	});

	return apiSuccess({ status: "PROCESSING", deckId });
}
