"use client";

import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import DueToday from "@/components/dashboard/DueToday";
import StreakTracker from "@/components/dashboard/StreakTracker";
import DeckGrid from "@/components/deck/DeckGrid";
import WeakSpotsList from "@/components/deck/WeakSpotsList";
import { Button } from "@/components/ui/Button";
import type { CardWithSM2 } from "@/types/card";
import type { DeckSummary } from "@/types/deck";
import type { UserStreak } from "@/types/user";

type DashboardContentProps = {
  userFirstName: string;
  decks: DeckSummary[];
  weakSpots: CardWithSM2[];
  totalDueToday: number;
  streak: UserStreak;
  dueDeckId?: string;
};

export default function DashboardContent({
  userFirstName,
  decks,
  weakSpots,
  totalDueToday,
  streak,
  dueDeckId,
}: DashboardContentProps) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userFirstName} 👋</h1>
        <p className="mt-1 text-slate-600">Here&apos;s your study overview</p>
      </div>

      {decks.length === 0 ? (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-5">
          <h2 className="text-lg font-semibold text-indigo-900">Ready for your first deck?</h2>
          <p className="mt-1 text-sm text-indigo-800">
            Create your first deck to start generating and reviewing flashcards.
          </p>
          <Button variant="primary" href="/decks/new" startIcon={<AddIcon />} sx={{ mt: 2 }}>
            Create First Deck
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StreakTracker
          streakCurrent={streak.streakCurrent}
          streakLongest={streak.streakLongest}
        />
        <DueToday
          dueCount={totalDueToday}
          onClick={() => {
            if (dueDeckId) {
              router.push(`/decks/${dueDeckId}/study`);
            } else {
              router.push("/decks");
            }
          }}
        />
      </div>

      {weakSpots.length > 0 ? <WeakSpotsList cards={weakSpots} /> : null}

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Your Decks</h2>
          <Button variant="primary" href="/decks/new" startIcon={<AddIcon />}>
            New Deck
          </Button>
        </div>

        <DeckGrid decks={decks} onDeckChange={() => router.refresh()} />
      </div>
    </div>
  );
}
