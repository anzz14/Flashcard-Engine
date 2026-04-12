import Link from "next/link";
import { notFound } from "next/navigation";
import CardList from "@/components/cards/CardList";
import { auth } from "@/lib/auth";
import { getCardsForDeck } from "@/services/cardService";
import { getDeckById } from "@/services/deckService";

type Props = {
  params: Promise<{ deckId: string }>;
};

export default async function EditDeckCardsPage({ params }: Props) {
  const { deckId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const deck = await getDeckById(deckId, session.user.id);
  if (!deck || deck.archived) {
    notFound();
  }

  if (deck.userId !== session.user.id) {
    notFound();
  }

  const cards = await getCardsForDeck(deckId, session.user.id);
  const uniqueTopics = Array.from(
    new Set(
      cards
        .map((card) => card.topicTag?.trim())
        .filter((topic): topic is string => Boolean(topic))
    )
  );

  return (
    <div className="space-y-4">
     
      <p className="text-black font-bold">{deck.cardCount} cards total</p>

      <CardList deckId={deckId} topics={uniqueTopics} />
    </div>
  );
}
