import { applyRating } from "../src/lib/sm2";
import { splitIntoChunks } from "../src/lib/chunker";
import {
  cn,
  daysFromNow,
  getMasteryColor,
  pluralize,
  truncate,
} from "../src/lib/utils";

function testAssert(condition: unknown, message: string): void {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
}

// SM-2 Tests
const baseCard = { interval: 2, easeFactor: 2.5, repetitions: 3 };

const again = applyRating(baseCard, "AGAIN");
testAssert(again.interval === 1, "AGAIN should reset interval to 1");
testAssert(again.repetitions === 0, "AGAIN should reset repetitions to 0");
testAssert(again.easeFactor < 2.5, "AGAIN should decrease ease factor");
testAssert(again.easeFactor >= 1.3, "ease factor floor is 1.3");

const hard = applyRating(baseCard, "HARD");
testAssert(hard.interval === Math.round(2 * 1.2), "HARD multiplies interval by 1.2");
testAssert(hard.easeFactor < 2.5, "HARD decreases ease factor");

const good = applyRating(baseCard, "GOOD");
testAssert(good.interval === Math.round(2 * 2.5), "GOOD multiplies by ease factor");
testAssert(good.repetitions === 4, "GOOD increments repetitions");

const easy = applyRating(baseCard, "EASY");
testAssert(easy.easeFactor > 2.5, "EASY increases ease factor");
testAssert(easy.easeFactor <= 3.0, "ease factor ceiling is 3.0");

// Edge: first review GOOD (repetitions=0) should give interval=1
const firstReview = applyRating(
  { interval: 1, easeFactor: 2.5, repetitions: 0 },
  "GOOD"
);
testAssert(firstReview.interval === 1, "First GOOD review gives interval 1");

// Chunker Tests
const shortText = "This is a short text.";
const shortChunks = splitIntoChunks(shortText);
testAssert(shortChunks.length === 1, "Short text returns 1 chunk");

const longText =
  "Introduction\n\n" + "word ".repeat(300) + "\n\nConclusion\n\n" + "word ".repeat(200);
const longChunks = splitIntoChunks(longText);
testAssert(longChunks.length >= 2, "Long text with headings creates multiple chunks");
testAssert(longChunks[0].heading === "Introduction", "First chunk has correct heading");

// Utils Tests
testAssert(cn("foo", "bar") === "foo bar", "cn merges classes");
testAssert(truncate("hello world", 8) === "hello...", "truncate works");
testAssert(pluralize(1, "card") === "1 card", "singular pluralize");
testAssert(pluralize(3, "card") === "3 cards", "plural pluralize");
testAssert(getMasteryColor(20) === "bg-red-400", "low mastery is red");
testAssert(getMasteryColor(90) === "bg-green-400", "high mastery is green");
const tomorrow = daysFromNow(1);
testAssert(tomorrow > new Date(), "daysFromNow(1) is in the future");

console.log("✅ All lib unit tests passed!");
