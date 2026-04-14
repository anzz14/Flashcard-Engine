"use client";

import { ArrowRightCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { DeckSummary } from "@/types/deck";

type RecentDecksProps = {
  decks: DeckSummary[];
};

export default function RecentDecks({ decks }: RecentDecksProps) {
  const router = useRouter();

  if (decks.length === 0) {
    return null;
  }

  const displayDecks = decks.slice(0, 3);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {displayDecks.map((deck) => (
        <Card key={deck.id} className="min-w-65 flex-1 p-5" hoverable>
          <div className="space-y-3">
            <h3 className="truncate text-base font-semibold text-[#ff6a3d]" title={deck.name}>
              {deck.name}
            </h3>

            <p className="text-sm text-white">
              <span
                className={`font-semibold ${
                  deck.dueToday < 3
                    ? "text-emerald-600"
                    : deck.dueToday < 10
                      ? "text-amber-500"
                      : "text-[#ff6a3d]"
                }`}
              >
                {deck.dueToday}
              </span>{" "}
              due today
            </p>

            <Button
              variant="secondary"
              size="small"
              endIcon={<ArrowRightCircle className="h-4 w-4 text-white" />}
              onClick={() => router.push(`/decks/${deck.id}/study`)}
            >
              Quick Start
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
