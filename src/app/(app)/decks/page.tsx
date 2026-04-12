import DecksPageContent from "@/components/deck/DecksPageContent";
import { auth } from "@/lib/auth";
import { getUserDecks } from "@/services/deckService";

export default async function DecksPage() {
  const session = await auth();
  const userId = session!.user.id;
  const decks = await getUserDecks(userId);

  return <DecksPageContent decks={decks} />;
}

