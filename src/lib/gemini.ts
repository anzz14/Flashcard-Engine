import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RawCard } from "../types/card";
import type { Chunk } from "../types/generation";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
    maxOutputTokens: 2048,
  },
});

function isValidRawCard(value: unknown): value is RawCard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.question === "string" &&
    typeof candidate.answer === "string" &&
    typeof candidate.topicTag === "string"
  );
}

export async function generateFlashcardsFromChunk(
  chunk: Chunk
): Promise<RawCard[]> {
  const prompt = `You are an expert teacher creating flashcards for students. Your job is to extract
the most important concepts from the following text and turn them into clear,
effective flashcards.

Topic section: "${chunk.heading}"

Text:
"""
${chunk.content}
"""

Create flashcards that cover:
- Key definitions and what terms mean
- Relationships and connections between concepts
- Cause and effect relationships
- Important examples that illustrate concepts
- Edge cases or common misconceptions students get wrong
- Any formulas, rules, or frameworks mentioned

Rules:
- Questions should be specific, not vague ("What is X?" not "Tell me about X")
- Answers should be concise — 1-3 sentences maximum
- Do not create duplicate cards covering the same concept
- Create between 3 and 8 cards from this section (quality over quantity)

Return ONLY a valid JSON array with this exact shape, no other text:
[{ "question": "...", "answer": "...", "topicTag": "${chunk.heading}" }]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini response is not an array");
    }

    if (!parsed.every((item) => isValidRawCard(item))) {
      throw new Error("Gemini response contains invalid card shapes");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to generate flashcards from chunk:", error);
    return [];
  }
}
