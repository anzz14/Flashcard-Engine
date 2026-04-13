"use client";

import { Target } from "lucide-react";
import { Badge, getTopicColor } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { truncate } from "@/lib/utils";
import type { CardWithSM2 } from "@/types/card";

type WeakSpotsListProps = {
  cards: CardWithSM2[];
  onViewCard?: (card: CardWithSM2) => void;
};

function getWeaknessWidthPercent(easeFactor: number): number {
  const minEase = 1.3;
  const maxEase = 2.5;
  const clamped = Math.max(minEase, Math.min(maxEase, easeFactor));
  const normalized = (maxEase - clamped) / (maxEase - minEase);

  // Keep a visible thin bar at high ease and full width at lowest ease.
  return Math.round(20 + normalized * 80);
}


export default function WeakSpotsList({ cards, onViewCard }: WeakSpotsListProps) {
  const { show } = useToast();

  const weakestCards = [...cards]
    .sort((a, b) => a.easeFactor - b.easeFactor)
    .slice(0, 5);



  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-slate-700" />
        <h3 className="text-lg font-semibold text-slate-900">Weak Spots</h3>
      </div>
      <p className="mb-5 text-sm text-slate-600">Cards you struggle with most</p>

      {weakestCards.length === 0 ? (
        <p className="text-sm text-slate-500">No weak spots yet - keep studying!</p>
      ) : (
        <div className="space-y-3">
          {weakestCards.map((card) => {
            const topic = card.topicTag?.trim() || "General";
            const weaknessWidth = getWeaknessWidthPercent(card.easeFactor);
            const displayQuestion = truncate(card.question, 80);
            const isQuestionTruncated = displayQuestion !== card.question;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  if (typeof onViewCard === "function") {
                    onViewCard(card);
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-red-200 hover:bg-red-50/40"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p
                    className="text-sm font-medium text-slate-900"
                    title={isQuestionTruncated ? card.question : undefined}
                  >
                    {displayQuestion}
                  </p>
                  <Badge label={topic} color={getTopicColor(topic)} />
                </div>

                <div className="flex items-center justify-between gap-3">
               
                  <div className="h-2 w-28 rounded-full bg-red-100">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${weaknessWidth}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
