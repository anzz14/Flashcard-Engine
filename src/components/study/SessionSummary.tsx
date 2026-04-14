"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Flame } from "@/lib/lucide";
import CardSuggestions from "@/components/study/CardSuggestions";
import { Button } from "@/components/ui/Button";
import type { ReviewRating } from "@/types/card";
import type { UserStreak } from "@/types/user";

type SessionSummaryProps = {
  ratings: Record<string, ReviewRating>;
  totalCards: number;
  streakData: UserStreak | null;
  deckId: string;
};

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-white">{label}</p>
    </div>
  );
}

export default function SessionSummary({
  ratings,
  totalCards,
  streakData,
  deckId,
}: SessionSummaryProps) {
  const router = useRouter();
  const [addedCount, setAddedCount] = useState(0);

  const handleStudyAgain = () => {
    router.push(`/decks/${deckId}/last-session`);
  };

  const counts = useMemo(() => {
    const values = Object.values(ratings);
    return {
      again: values.filter((rating) => rating === "AGAIN").length,
      hard: values.filter((rating) => rating === "HARD").length,
      good: values.filter((rating) => rating === "GOOD").length,
      easy: values.filter((rating) => rating === "EASY").length,
    };
  }, [ratings]);

  const masteredToday = counts.good + counts.easy;

  const streakIncreased = useMemo(() => {
    if (!streakData) return false;

    if (typeof window === "undefined") return false;
    const stored = window.sessionStorage.getItem("study:preSessionStreak");
    const baseline = stored ? Number(stored) : NaN;

    if (Number.isNaN(baseline)) return false;
    return streakData.streakCurrent > baseline;
  }, [streakData]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-white/10 bg-[#151515] p-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#ff6a3d]">Session Complete!</h2>
        <p className="mt-1 text-sm text-white">
          You reviewed {Object.keys(ratings).length || totalCards} cards this session.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatPill label="Again" value={counts.again} color="text-red-600" />
        <StatPill label="Hard" value={counts.hard} color="text-orange-600" />
        <StatPill label="Medium" value={counts.good} color="text-yellow-600" />
        <StatPill label="Easy" value={counts.easy} color="text-green-600" />
      </div>

      {masteredToday > 0 ? (
        <p className="text-center text-sm font-medium text-emerald-400">
          Mastered today: {masteredToday} cards
        </p>
      ) : null}

      {streakData && streakIncreased ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-[#ff6a3d]/35 bg-[rgba(255,59,0,0.10)] p-4 text-center"
        >
          <p className="inline-flex items-center gap-2 text-xl font-bold text-[#ff6a3d]">
            <Flame size={20} />
            <span>Streak up!</span>
          </p>
          <p className="text-sm text-[#ff9a7c]">Current streak: {streakData.streakCurrent} days</p>
        </motion.div>
      ) : null}

      {totalCards >= 3 && (
        <CardSuggestions
          deckId={deckId}
          onAdded={(count) => setAddedCount(count)}
        />
      )}

      {addedCount > 0 && (
        <p className="flex items-center justify-center gap-2 text-center text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{addedCount} new cards added - they'll appear in tomorrow's session</span>
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="primary" onClick={handleStudyAgain}>
          Study Again
        </Button>
        <Button variant="secondary" onClick={() => router.push(`/decks/${deckId}`)}>
          Back to Deck
        </Button>
      </div>
    </div>
  );
}
