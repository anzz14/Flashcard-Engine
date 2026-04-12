import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  getUserDecks,
  createDeck,
  archiveDeck,
  getWeakSpots,
} from "../src/services/deckService";
import {
  createCard,
  updateCard,
  deleteCard,
  bulkCreateCards,
} from "../src/services/cardService";
import { applyReview } from "../src/services/reviewService";
import { buildSessionQueue } from "../src/services/sessionService";
import { updateStreak, getDeckTopicStats } from "../src/services/progressService";

function testAssert(condition: unknown, message: string): void {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Do not run scripts/test-services.ts in production.");
  }

  // Setup: get or create a test user
  const existing = await prisma.user.findUnique({
    where: { email: "test-services@flashcard.app" },
    select: { id: true },
  });

  const testUser = await prisma.user.upsert({
    where: { email: "test-services@flashcard.app" },
    update: {},
    create: {
      email: "test-services@flashcard.app",
      name: "Test",
      password: "ignored",
    },
  });
  const userId = testUser.id;

  let deckId = "";

  try {
    // Test 1: createDeck
    const deck = await createDeck(userId, "Test Deck");
    deckId = deck.id;
    testAssert(Boolean(deckId), "createDeck should return id");
    console.log("PASS createDeck");

    // Test 2: getUserDecks
    const decks = await getUserDecks(userId);
    testAssert(
      decks.some((d) => d.id === deckId),
      "getUserDecks should include new deck"
    );
    console.log("PASS getUserDecks");

    // Test 3: createCard
    const card = await createCard(deckId, userId, {
      question: "What is active recall?",
      answer:
        "Retrieving information from memory instead of passively reviewing it.",
      topicTag: "Memory",
    });
    testAssert(card.isNew === true, "new card should have isNew=true");
    testAssert(card.interval === 1, "new card should have interval=1");
    console.log("PASS createCard");

    // Test 4: bulkCreateCards
    const bulkCount = await bulkCreateCards(deckId, [
      { question: "Q1?", answer: "A1", topicTag: "Memory" },
      { question: "Q2?", answer: "A2", topicTag: "Learning" },
    ]);
    testAssert(bulkCount === 2, "bulkCreateCards should create 2 cards");
    console.log("PASS bulkCreateCards");

    // Test 5: buildSessionQueue
    const session = await buildSessionQueue(deckId, userId);
    testAssert(session.cards.length > 0, "session should have cards");
    testAssert(session.totalNew > 0, "session should have new cards");
    console.log("PASS buildSessionQueue");

    // Test 6: applyReview — rate the first card as GOOD
    const updatedSM2 = await applyReview(card.id, userId, "GOOD");
    testAssert(updatedSM2.isNew === false, "reviewed card should not be new");
    testAssert(updatedSM2.interval >= 1, "interval should be at least 1");

    // Verify DB was updated
    const updatedCard = await prisma.card.findUnique({ where: { id: card.id } });
    testAssert(
      updatedCard?.isNew === false,
      "DB card isNew should be false after review"
    );
    console.log("PASS applyReview");

    // Test 7: updateStreak
    const streak = await updateStreak(userId);
    testAssert(
      streak.streakCurrent >= 1,
      "streak should be at least 1 after studying"
    );
    console.log("PASS updateStreak");

    // Test 8: getDeckTopicStats
    const topics = await getDeckTopicStats(deckId);
    testAssert(Array.isArray(topics), "getDeckTopicStats returns array");
    console.log("PASS getDeckTopicStats", topics);

    // Optional sanity checks for imported functions that would otherwise be unused
    const weakSpots = await getWeakSpots(userId, 3);
    testAssert(Array.isArray(weakSpots), "getWeakSpots returns array");
    const edited = await updateCard(card.id, userId, {
      question: "What is active recall in learning?",
    });
    testAssert(
      edited.question.includes("active recall"),
      "updateCard should update question"
    );
    const tempCard = await createCard(deckId, userId, {
      question: "Temp?",
      answer: "Temp",
      topicTag: "Temp",
    });
    await deleteCard(tempCard.id, userId);
    console.log("PASS updateCard/deleteCard/getWeakSpots");

    // Test 9: archiveDeck
    await archiveDeck(deckId, userId);
    const decksAfterArchive = await getUserDecks(userId);
    testAssert(
      !decksAfterArchive.some((d) => d.id === deckId),
      "archived deck should not appear in list"
    );
    console.log("PASS archiveDeck");
  } finally {
    if (deckId) {
      await prisma.deck.delete({ where: { id: deckId } }).catch(() => undefined);
    }

    if (!existing) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }

    console.log("Cleanup complete");
  }

  console.log("\nAll service tests passed.");
}

runTests()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
