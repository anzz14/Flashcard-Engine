"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getMasteryColor, truncate } from "@/lib/utils";
import type { TopicStat } from "@/types/deck";

type TopicHeatmapProps = {
  topics: TopicStat[];
  deckId: string;
};

export default function TopicHeatmap({ topics, deckId }: TopicHeatmapProps) {
  const router = useRouter();

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Topic Mastery</h3>

      {topics.length === 0 ? (
        <p className="text-sm text-slate-600">
          No topics yet — cards without topic tags appear here
        </p>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
        >
          {topics.map((topic) => (
            <Card
              key={topic.topicTag}
              hoverable
              onClick={() =>
                router.push(
                  `/decks/${deckId}/study?topic=${encodeURIComponent(topic.topicTag)}`
                )
              }
              className={`${getMasteryColor(topic.masteryPercent)} p-4 text-white`}
            >
              <div className="space-y-1">
                <p className="truncate text-sm font-medium text-white/95">
                  {truncate(topic.topicTag, 20)}
                </p>
                <p className="text-3xl font-bold leading-none">{topic.masteryPercent}%</p>
                <p className="text-xs text-white/90">
                  {topic.mastered}/{topic.total} cards
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
