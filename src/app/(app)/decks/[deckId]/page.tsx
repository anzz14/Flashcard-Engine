import { notFound } from "next/navigation";
import CardList from "@/components/cards/CardList";
import DeckHeader from "@/components/deck/DeckHeader";
import DeckStats from "@/components/deck/DeckStats";
import TopicHeatmap from "@/components/deck/TopicHeatmap";
import { auth } from "@/lib/auth";
import { getDeckById } from "@/services/deckService";
import { getDeckTopicStats } from "@/services/progressService";

type Props = { params: { deckId: string } };

export default async function DeckDetailPage({ params }: Props) {
	const session = await auth();
	const userId = session!.user.id;

	const deck = await getDeckById(params.deckId, userId);
	if (!deck || deck.archived) {
		notFound();
	}

	const topicStats = await getDeckTopicStats(deck.id);
	const uniqueTopics = [...new Set(topicStats.map((topic) => topic.topicTag))];

	return (
		<div className="space-y-6">
			<DeckHeader deck={deck} />
			<DeckStats deck={deck} />
			<TopicHeatmap topics={deck.topics} deckId={deck.id} />

			<div>
				<h2 className="mb-4 text-xl font-semibold text-slate-900">All Cards</h2>
				<CardList deckId={deck.id} topics={uniqueTopics} />
			</div>
		</div>
	);
}

