import { auth } from "@/lib/auth";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { getUserDecks, getWeakSpots } from "@/services/deckService";
import { getUserStats } from "@/services/progressService";

export default async function DashboardPage() {
	const session = (await auth()) as { user?: { id?: string; name?: string | null } } | null;

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const userId = session.user.id;

	const [decks, weakSpots, stats] = await Promise.all([
		getUserDecks(userId),
		getWeakSpots(userId, 5),
		getUserStats(userId),
	]);

	const dueDeckId = decks.find((deck) => deck.dueToday > 0)?.id;
	const userFirstName = session?.user?.name?.split(" ")[0] ?? "there";

	return (
		<DashboardContent
			userFirstName={userFirstName}
			decks={decks}
			weakSpots={weakSpots}
			totalDueToday={stats.totalDueToday}
			streak={stats.streak}
			dueDeckId={dueDeckId}
		/>
	);
}

