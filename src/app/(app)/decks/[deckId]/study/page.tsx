import { notFound } from "next/navigation";
import EmptySession from "@/components/study/EmptySession";
import StudySession from "@/components/study/StudySession";
import { auth } from "@/lib/auth";
import { buildSessionQueue } from "@/services/sessionService";

type Props = {
	params: Promise<{ deckId: string }>;
	searchParams: Promise<{ topic?: string }>;
};

export default async function StudyPage({ params, searchParams }: Props) {
	const { deckId } = await params;
	const resolvedSearchParams = await searchParams;
	const session = await auth();
	const userId = session!.user.id;

	let sessionData: Awaited<ReturnType<typeof buildSessionQueue>>;

	try {
		sessionData = await buildSessionQueue(deckId, userId, {
			topic: resolvedSearchParams.topic,
		});
	} catch {
		notFound();
	}

	const { cards, totalNew, totalDue } = sessionData;

	return (
		<div className="min-h-screen bg-gray-50 px-4 py-8">
			{cards.length === 0 ? (
				<EmptySession deckId={deckId} topicFilter={resolvedSearchParams.topic} />
			) : (
				<StudySession
					initialCards={cards}
					totalNew={totalNew}
					totalDue={totalDue}
					deckId={deckId}
				/>
			)}
		</div>
	);
}

