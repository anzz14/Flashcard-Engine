"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

type EmptySessionProps = {
  deckId: string;
  topicFilter?: string;
};

type SessionResponse = {
  nextDueDate?: string | null;
};

export default function EmptySession({ deckId, topicFilter }: EmptySessionProps) {
  const router = useRouter();
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadNextDue = async () => {
      const params = new URLSearchParams();
      if (topicFilter) {
        params.set("topic", topicFilter);
      }

      const query = params.toString();
      const url = `/api/decks/${deckId}/session${query ? `?${query}` : ""}`;

      try {
        const response = await fetch(url);
        if (!response.ok) return;

        const data = (await response.json()) as SessionResponse;
        if (!mounted) return;

        setNextDueDate(data.nextDueDate ?? null);
      } catch {
        if (!mounted) return;
        setNextDueDate(null);
      }
    };

    void loadNextDue();

    return () => {
      mounted = false;
    };
  }, [deckId, topicFilter]);

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="flex justify-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
      </div>

      <h2 className="text-2xl font-bold text-[#ff6a3d]">You&apos;re all caught up!</h2>

      {topicFilter ? (
        <p className="text-sm text-white">No {topicFilter} cards due today</p>
      ) : null}

      <p className="text-sm text-white">
        Next review: {nextDueDate ? formatDate(nextDueDate) : "No upcoming reviews"}
      </p>

      <div className="pt-2">
        <Button variant="secondary" onClick={() => router.push(`/decks/${deckId}`)}>
          Back to Deck
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push(`/decks/${deckId}/last-session`)}
          sx={{
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          View Last Session
        </Button>
      </div>
    </div>
  );
}
