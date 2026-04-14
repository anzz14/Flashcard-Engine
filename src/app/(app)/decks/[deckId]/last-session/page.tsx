import Link from "next/link";
import { redirect } from "next/navigation";
import LastSessionClient from "@/components/study/LastSessionClient";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { getLastSession } from "@/services/reviewService";

type Props = { params: Promise<{ deckId: string }> };

export default async function DeckLastSessionPage({ params }: Props) {
  const { deckId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getLastSession(deckId, session.user.id);

  if (result.sessionDate === null) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#ff6a3d]">No previous session found</p>
          <div className="pt-2">
            <Button variant="secondary" component={Link} href={`/decks/${deckId}`}>
              Back to Deck
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <LastSessionClient cards={result.cards} sessionDate={result.sessionDate} deckId={deckId} />
    </div>
  );
}