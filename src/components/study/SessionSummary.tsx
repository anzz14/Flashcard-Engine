"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
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
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Session Complete! 🎉</h2>
        <p className="mt-1 text-sm text-slate-600">
          You reviewed {Object.keys(ratings).length || totalCards} cards this session.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatPill label="Again" value={counts.again} color="text-red-600" />
        <StatPill label="Hard" value={counts.hard} color="text-orange-600" />
        <StatPill label="Good" value={counts.good} color="text-green-600" />
        <StatPill label="Easy" value={counts.easy} color="text-blue-600" />
      </div>

      {masteredToday > 0 ? (
        <p className="text-center text-sm font-medium text-emerald-700">
          Mastered today: {masteredToday} cards
        </p>
      ) : null}

      {streakData && streakIncreased ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center"
        >
          <p className="text-xl font-bold text-orange-700">🔥 Streak up!</p>
          <p className="text-sm text-orange-800">Current streak: {streakData.streakCurrent} days</p>
        </motion.div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="primary" onClick={() => router.push(`/decks/${deckId}/study`)}>
          Study Again
        </Button>
        <Button variant="secondary" onClick={() => router.push(`/decks/${deckId}`)}>
          Back to Deck
        </Button>
      </div>
    </div>
  );
}
