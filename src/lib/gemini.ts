import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RawCard } from "../types/card";
import type { Chunk } from "../types/generation";

type LLMProvider = "gemini" | "groq";

function looksLikeGroqKey(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().startsWith("gsk_");
}

function resolveProvider(): LLMProvider {
  const configured = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (configured === "gemini" || configured === "groq") {
    return configured;
  }

  if (process.env.GROQ_API_KEY) {
    return "groq";
  }

  if (looksLikeGroqKey(process.env.GEMINI_API_KEY)) {
    return "groq";
  }

  return "gemini";
}

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

function normalizeRawCard(value: unknown, fallbackTopicTag: string): RawCard | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  const questionCandidate =
    typeof candidate.question === "string"
      ? candidate.question
      : typeof candidate.front === "string"
        ? candidate.front
        : typeof candidate.prompt === "string"
          ? candidate.prompt
          : "";

  const answerCandidate =
    typeof candidate.answer === "string"
      ? candidate.answer
      : typeof candidate.back === "string"
        ? candidate.back
        : typeof candidate.explanation === "string"
          ? candidate.explanation
          : "";

  const topicTagCandidate =
    typeof candidate.topicTag === "string"
      ? candidate.topicTag
      : typeof candidate.topic === "string"
        ? candidate.topic
        : fallbackTopicTag;

  const question = questionCandidate.trim();
  const answer = answerCandidate.trim();
  const topicTag = topicTagCandidate.trim() || fallbackTopicTag;

  if (!question || !answer) {
    return null;
  }

  return { question, answer, topicTag };
}

function tryParseJSON(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractJSONArrayPayload(text: string): unknown[] | null {
  const direct = tryParseJSON(text);
  if (Array.isArray(direct)) {
    return direct;
  }

  if (
    direct &&
    typeof direct === "object" &&
    Array.isArray((direct as Record<string, unknown>).cards)
  ) {
    return (direct as Record<string, unknown>).cards as unknown[];
  }

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) {
    const fenced = tryParseJSON(fenceMatch[1]);
    if (Array.isArray(fenced)) {
      return fenced;
    }
    if (
      fenced &&
      typeof fenced === "object" &&
      Array.isArray((fenced as Record<string, unknown>).cards)
    ) {
      return (fenced as Record<string, unknown>).cards as unknown[];
    }
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const sliced = text.slice(firstBracket, lastBracket + 1);
    const parsedSlice = tryParseJSON(sliced);
    if (Array.isArray(parsedSlice)) {
      return parsedSlice;
    }
  }

  return null;
}

function buildPrompt(chunk: Chunk): string {
  return `You are an expert teacher creating flashcards for students. Your job is to extract
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
- Answers should be concise - 1-3 sentences maximum
- Do not create duplicate cards covering the same concept
- Create between 3 and 8 cards from this section (quality over quantity)

Return ONLY a valid JSON array with this exact shape, no other text:
[{ "question": "...", "answer": "...", "topicTag": "${chunk.heading}" }]`;
}

type GeminiGenerationOverrides = {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
};

async function generateWithGemini(
  prompt: string,
  overrides?: GeminiGenerationOverrides
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. If you are using Groq, set LLM_PROVIDER=groq and GROQ_API_KEY."
    );
  }

  if (looksLikeGroqKey(apiKey)) {
    throw new Error(
      "GEMINI_API_KEY appears to be a Groq key (gsk_*). Set LLM_PROVIDER=groq and/or GROQ_API_KEY."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const baseGenerationConfig = {
    temperature: 0.4,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  };
  const generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType?: string;
  } = {
    ...baseGenerationConfig,
    ...overrides,
  };

  if (typeof generationConfig.responseMimeType === "undefined") {
    delete generationConfig.responseMimeType;
  }

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY ||
    (looksLikeGroqKey(process.env.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : undefined);
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing while LLM provider is set to groq"
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 1800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errBody}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq response did not contain message content");
  }

  return text;
}

async function generateWithOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const model = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "Flashcard Engine",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenRouter response did not contain message content");
  }

  return text;
}

async function withFallback(
  prompt: string,
  overrides?: GeminiGenerationOverrides
): Promise<string> {
  const primary = resolveProvider();
  const errors: string[] = [];

  try {
    const result =
      primary === "groq"
        ? await generateWithGroq(prompt)
        : await generateWithGemini(prompt, overrides);
    console.log(`[withFallback] Primary (${primary}) succeeded`);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`Primary (${primary}): ${msg}`);
    console.warn(`[withFallback] Primary (${primary}) failed:`, msg);
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openRouterKey) {
    try {
      console.warn("[withFallback] Trying OpenRouter fallback...");
      const result = await generateWithOpenRouter(prompt);
      console.log("[withFallback] OpenRouter fallback succeeded");
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`OpenRouter: ${msg}`);
      console.warn("[withFallback] OpenRouter failed:", msg);
    }
  }

  const groqFallbackKey = process.env.GROQ_API_KEY_FALLBACK?.trim();
  if (groqFallbackKey) {
    try {
      console.warn("[withFallback] Trying second Groq key...");
      const originalKey = process.env.GROQ_API_KEY;
      process.env.GROQ_API_KEY = groqFallbackKey;

      try {
        const result = await generateWithGroq(prompt);
        console.log("[withFallback] Second Groq key succeeded");
        return result;
      } finally {
        process.env.GROQ_API_KEY = originalKey;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Groq fallback key: ${msg}`);
      console.warn("[withFallback] Second Groq key failed:", msg);
    }
  }

  throw new Error(
    `All providers failed. Tried ${errors.length} provider(s):\n${errors.join("\n")}`
  );
}

export async function generateFlashcardsFromChunk(
  chunk: Chunk
): Promise<RawCard[]> {
  console.log(
    "[generateFlashcardsFromChunk] chunk preview:",
    `${chunk.heading} | words=${chunk.wordCount} | ${chunk.content.slice(0, 200)}...`
  );

  const prompt = buildPrompt(chunk);

  console.log("[generateFlashcardsFromChunk] prompt preview:", `${prompt.slice(0, 350)}...`);

  try {
    const text = await withFallback(prompt);
    console.log("[generateFlashcardsFromChunk] raw AI response:", text);
    const parsedArray = extractJSONArrayPayload(text);

    if (!parsedArray) {
      throw new Error("AI response does not contain a parseable JSON array");
    }

    const normalizedCards = parsedArray
      .map((item) => normalizeRawCard(item, chunk.heading))
      .filter((item): item is RawCard => item !== null)
      .filter((item) => isValidRawCard(item));

    if (normalizedCards.length === 0) {
      throw new Error("AI response contained no valid card entries");
    }

    console.log("[generateFlashcardsFromChunk] parsed cards:", normalizedCards);

    return normalizedCards;
  } catch (error) {
    console.error("Failed to generate flashcards from chunk:", error);
    throw error;
  }
}

export async function generateHintForCard(
  question: string,
  answer: string
): Promise<string> {
  const prompt = `You are a helpful study assistant. A student is struggling to remember the answer
to a flashcard. Your job is to give them a subtle hint that nudges their memory
WITHOUT revealing the answer directly.

Question: "${question}"
Answer (DO NOT reveal this): "${answer}"

Rules:
- Give exactly 1 hint in 1-2 sentences maximum
- Do NOT repeat or paraphrase the answer
- Do NOT say "the answer is..." or "it involves..."
- Instead: point to a related concept, a memory anchor, an analogy, or the category
  the answer belongs to
- If the answer is a definition, hint at what field or domain it comes from
- If the answer involves a process, hint at the first step only
- Tone: encouraging, like a teacher who wants the student to figure it out themselves

Return ONLY the hint text. No labels, no preamble, no quotation marks.`;

  try {
    const result = await withFallback(prompt, {
      temperature: 0.6,
      maxOutputTokens: 150,
      responseMimeType: undefined,
    });

    return result.trim();
  } catch (error) {
    throw error;
  }
}

export async function generateCardSuggestions(
  weakCards: Array<{ question: string; answer: string; topicTag: string | null }>,
  existingQuestions: string[]
): Promise<Array<{ question: string; answer: string; topicTag: string }>> {
  const prompt = `You are an expert teacher analyzing a student's weak flashcards to identify
knowledge gaps. Based on the cards they struggle with most, suggest NEW flashcards
that would fill in missing foundational concepts.

The student's weakest cards are:
${weakCards
  .map(
    (c, i) =>
      `${i + 1}. Q: "${c.question}" | A: "${c.answer}" | Topic: "${c.topicTag ?? "General"}"`
  )
  .join("\n")}

Cards they already have (DO NOT suggest these or close variations):
${existingQuestions
  .slice(0, 20)
  .map((q, i) => `${i + 1}. "${q}"`)
  .join("\n")}

Your task:
- Identify what foundational concepts are MISSING based on what they struggle with
- Suggest exactly 3 new flashcards that would help fill those gaps
- Each card must be on a concept NOT already in their deck
- Cards should be specific and actionable, not vague
- Keep the same topic tags as the weak cards where relevant

Return ONLY a valid JSON array, no other text:
[{ "question": "...", "answer": "...", "topicTag": "..." }]`;

  try {
    const text = await withFallback(prompt, {
      responseMimeType: "application/json",
      temperature: 0.5,
      maxOutputTokens: 1024,
    });

    const parsedArray = extractJSONArrayPayload(text);
    if (!parsedArray) {
      return [];
    }

    const suggestions = parsedArray
      .map((item) => {
        if (typeof item !== "object" || item === null) {
          return null;
        }
        const candidate = item as Record<string, unknown>;
        if (
          typeof candidate.question !== "string" ||
          typeof candidate.answer !== "string" ||
          typeof candidate.topicTag !== "string"
        ) {
          return null;
        }

        const question = candidate.question.trim();
        const answer = candidate.answer.trim();
        const topicTag = candidate.topicTag.trim();
        if (!question || !answer || !topicTag) {
          return null;
        }

        return { question, answer, topicTag };
      })
      .filter((item): item is { question: string; answer: string; topicTag: string } => item !== null)
      .slice(0, 3);

    return suggestions;
  } catch (error) {
    console.error("Failed to generate card suggestions:", error);
    return [];
  }
}
