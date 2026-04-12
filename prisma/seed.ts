import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
	adapter,
	log: ["error"],
});

async function main() {
	const demoUser = await prisma.user.upsert({
		where: { email: "demo@flashcard.app" },
		update: { name: "Demo User" },
		create: {
			email: "demo@flashcard.app",
			name: "Demo User",
		},
	});

	await prisma.deck.deleteMany({
		where: {
			userId: demoUser.id,
			name: "Memory Science 101",
		},
	});

	const deck = await prisma.deck.create({
		data: {
			name: "Memory Science 101",
			userId: demoUser.id,
		},
	});

	await prisma.generationJob.create({
		data: {
			deckId: deck.id,
			status: "DONE",
			doneChunks: 5,
			totalChunks: 5,
		},
	});

	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const today = new Date(now);
	const nextWeek = new Date(now);
	nextWeek.setDate(now.getDate() + 7);

	const cards = [
		{
			question: "What is spaced repetition?",
			answer:
				"A study technique where review sessions are spaced over increasing intervals to exploit the spacing effect and improve long-term retention.",
			topicTag: "Spaced Repetition",
			isNew: false,
			nextReviewDate: yesterday,
			easeFactor: 1.4,
			repetitions: 2,
			interval: 1,
		},
		{
			question: "Why do spaced intervals improve retention compared to cramming?",
			answer:
				"Each retrieval after some forgetting effort strengthens memory traces more than massed practice, which often produces short-lived familiarity.",
			topicTag: "Spaced Repetition",
			isNew: false,
			nextReviewDate: yesterday,
			easeFactor: 1.7,
			repetitions: 3,
			interval: 2,
		},
		{
			question: "What happens if you review too late in a spaced repetition system?",
			answer:
				"Recall becomes harder, often causing a lower rating and shorter future interval until the memory is stabilized again.",
			topicTag: "Spaced Repetition",
			isNew: false,
			nextReviewDate: yesterday,
			easeFactor: 2.0,
			repetitions: 2,
			interval: 1,
		},
		{
			question: "How does interval growth work after successful recalls?",
			answer:
				"Intervals are multiplied or expanded based on recall quality so easier cards are seen less often over time.",
			topicTag: "Spaced Repetition",
			isNew: false,
			nextReviewDate: today,
			easeFactor: 2.2,
			repetitions: 5,
			interval: 6,
		},
		{
			question: "Which daily habit makes spaced repetition most effective?",
			answer:
				"Consistent short review sessions, because small delays compound and create large backlogs.",
			topicTag: "Spaced Repetition",
			isNew: false,
			nextReviewDate: today,
			easeFactor: 2.3,
			repetitions: 4,
			interval: 4,
		},
		{
			question: "What is active recall?",
			answer:
				"A learning method where you retrieve information from memory without looking at notes, strengthening retrieval pathways.",
			topicTag: "Active Recall",
			isNew: false,
			nextReviewDate: nextWeek,
			easeFactor: 2.5,
			repetitions: 8,
			interval: 14,
		},
		{
			question: "Why are flashcards effective for active recall?",
			answer:
				"They force a clear question-first prompt, making you generate the answer before checking correctness.",
			topicTag: "Active Recall",
			isNew: false,
			nextReviewDate: nextWeek,
			easeFactor: 2.6,
			repetitions: 10,
			interval: 18,
		},
		{
			question: "How does active recall differ from rereading?",
			answer:
				"Rereading feels fluent but passive, while active recall creates effortful retrieval that better predicts long-term memory.",
			topicTag: "Active Recall",
			isNew: false,
			nextReviewDate: nextWeek,
			easeFactor: 2.7,
			repetitions: 9,
			interval: 16,
		},
		{
			question: "Name one way to practice active recall without flashcards.",
			answer:
				"Use blank-page recall: close materials and write everything you can remember, then compare against source notes.",
			topicTag: "Active Recall",
			isNew: false,
			nextReviewDate: nextWeek,
			easeFactor: 2.9,
			repetitions: 7,
			interval: 12,
		},
		{
			question: "When should you check the answer during active recall practice?",
			answer:
				"Only after making a genuine retrieval attempt, so you avoid turning the exercise into passive recognition.",
			topicTag: "Active Recall",
			isNew: false,
			nextReviewDate: nextWeek,
			easeFactor: 3.0,
			repetitions: 11,
			interval: 21,
		},
		{
			question: "Who discovered the Forgetting Curve?",
			answer:
				"Hermann Ebbinghaus in 1885, through self-experiments measuring memory decay over time.",
			topicTag: "The Forgetting Curve",
			isNew: true,
			nextReviewDate: today,
			easeFactor: 2.5,
			repetitions: 0,
			interval: 1,
		},
		{
			question: "What does the Forgetting Curve describe?",
			answer:
				"It models how newly learned information drops from memory quickly at first, then levels off without review.",
			topicTag: "The Forgetting Curve",
			isNew: true,
			nextReviewDate: today,
			easeFactor: 2.5,
			repetitions: 0,
			interval: 1,
		},
		{
			question: "How does review affect the Forgetting Curve?",
			answer:
				"Each successful review resets and flattens the curve, slowing future forgetting.",
			topicTag: "The Forgetting Curve",
			isNew: true,
			nextReviewDate: today,
			easeFactor: 2.5,
			repetitions: 0,
			interval: 1,
		},
		{
			question: "Why is immediate relearning after forgetting useful?",
			answer:
				"Recovering a nearly forgotten memory strengthens it more than reviewing when the answer is still obvious.",
			topicTag: "The Forgetting Curve",
			isNew: false,
			nextReviewDate: today,
			easeFactor: 2.2,
			repetitions: 3,
			interval: 3,
		},
		{
			question: "What is a practical sign that a card is on the steep part of the curve?",
			answer:
				"You frequently hesitate or fail within a day or two, indicating intervals are currently too long.",
			topicTag: "The Forgetting Curve",
			isNew: false,
			nextReviewDate: today,
			easeFactor: 2.1,
			repetitions: 4,
			interval: 2,
		},
	];

	await prisma.card.createMany({
		data: cards.map((card) => ({
			...card,
			deckId: deck.id,
		})),
	});

	console.log("Seed complete: created demo user, deck, generation job, and 15 cards.");
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
