import { EventEmitter } from "events";
import { splitIntoChunks } from "@/lib/chunker";
import { generateFlashcardsFromChunk } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { bulkCreateCards } from "@/services/cardService";
import type { ProgressEvent } from "@/types/generation";

export const generationEvents = new EventEmitter();
generationEvents.setMaxListeners(50);

export async function generateCardsForDeck(
  deckId: string,
  text: string
): Promise<{ cardCount: number }> {
  let totalChunks = 0;
  let doneChunks = 0;
  const chunkErrors: string[] = [];

  try {
    await prisma.generationJob.upsert({
      where: { deckId },
      create: { deckId, status: "PROCESSING", totalChunks: 0, doneChunks: 0 },
      update: {
        status: "PROCESSING",
        totalChunks: 0,
        doneChunks: 0,
        errorMessage: null,
      },
    });

    const chunks = splitIntoChunks(text);
    console.log(
      `[generateCardsForDeck] deck=${deckId} split into ${chunks.length} chunks`,
      chunks.map((c, i) => ({ index: i, heading: c.heading, wordCount: c.wordCount }))
    );
    if (chunks.length === 0) {
      throw new Error("No content could be extracted from the text");
    }

    totalChunks = chunks.length;

    await prisma.generationJob.update({
      where: { deckId },
      data: { totalChunks: chunks.length },
    });

    generationEvents.emit(deckId, {
      doneChunks: 0,
      totalChunks: chunks.length,
      status: "PROCESSING",
      progress: 0,
      message: `Starting generation for ${chunks.length} chunks`,
    } as ProgressEvent);

    let totalCards = 0;

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];

      try {
        const rawCards = await generateFlashcardsFromChunk(chunk);
        console.log(
          `[generateCardsForDeck] chunk ${i + 1}/${chunks.length} produced ${rawCards.length} cards`
        );

        if (rawCards.length > 0) {
          await bulkCreateCards(deckId, rawCards);
          totalCards += rawCards.length;
        }
      } catch (error) {
        const chunkMessage =
          error instanceof Error ? error.message : "Unknown chunk generation error";
        const fullMessage = `Chunk ${i + 1}/${chunks.length} failed: ${chunkMessage}`;
        console.error(`[generateCardsForDeck] ${fullMessage}`);
        chunkErrors.push(fullMessage);
      }

      doneChunks = i + 1;

      await prisma.generationJob.update({
        where: { deckId },
        data: { doneChunks },
      });

      generationEvents.emit(deckId, {
        doneChunks,
        totalChunks: chunks.length,
        status: "PROCESSING",
        progress: Math.round((doneChunks / chunks.length) * 100),
        message: `Processed chunk ${doneChunks} of ${chunks.length}`,
      } as ProgressEvent);

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (totalCards === 0) {
      const reason =
        chunkErrors.length > 0
          ? chunkErrors.slice(0, 2).join(" | ")
          : "No valid cards could be parsed from model responses";
      throw new Error(`Generation completed but produced 0 cards. ${reason}`);
    }

    await prisma.generationJob.update({
      where: { deckId },
      data: { status: "DONE", doneChunks: chunks.length },
    });

    generationEvents.emit(deckId, {
      doneChunks: chunks.length,
      totalChunks: chunks.length,
      status: "DONE",
      progress: 100,
      message: `Generation complete: ${totalCards} cards created`,
      cardCount: totalCards,
    } as ProgressEvent);

    return { cardCount: totalCards };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await prisma.generationJob
      .update({
        where: { deckId },
        data: {
          status: "FAILED",
          errorMessage: message,
        },
      })
      .catch(() => undefined);

    generationEvents.emit(deckId, {
      doneChunks,
      totalChunks,
      status: "FAILED",
      progress:
        totalChunks > 0 ? Math.round((doneChunks / totalChunks) * 100) : 0,
      message,
      errorMessage: message,
    } as ProgressEvent);

    throw error;
  }
}
