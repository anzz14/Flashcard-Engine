"use client";

import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { truncate } from "@/lib/utils";
import type { TopicStat } from "@/types/deck";

type TopicHeatmapProps = {
  topics: TopicStat[];
  deckId: string;
};

export default function TopicHeatmap({ topics, deckId }: TopicHeatmapProps) {
  const router = useRouter();

  const getBorderColor = (masteryPercent: number): string => {
    if (masteryPercent <= 25) return "border-red-400/70";
    if (masteryPercent <= 50) return "border-orange-400/70";
    if (masteryPercent <= 75) return "border-amber-400/70";
    return "border-emerald-400/70";
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-[#ff6a3d]">Topic Mastery</h3>

      {topics.length === 0 ? (
        <p className="text-sm text-white">
          No topics yet — cards without topic tags appear here
        </p>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}
        >
          {topics.map((topic) => {
            return (
              <Card
                key={topic.topicTag}
                hoverable
                onClick={() =>
                  router.push(
                    `/decks/${deckId}/study?topic=${encodeURIComponent(topic.topicTag)}`
                  )
                }
                className={`border-2 bg-[#151515] p-2.5 text-white ${getBorderColor(topic.masteryPercent)}`}
              >
                <Tooltip
                  title={topic.topicTag}
                  arrow
                  enterDelay={100}
                  placement="top"
                  slotProps={{
                    tooltip: { sx: { bgcolor: "#000000", color: "#ffffff" } },
                    arrow: { sx: { color: "#000000" } },
                  }}
                >
                  <div className="space-y-0.5">
                    <p className="truncate text-[11px] font-medium text-white">
                      {truncate(topic.topicTag, 20)}
                    </p>
                    <p className="text-xl font-bold leading-none text-[#ff6a3d]">{topic.masteryPercent}%</p>
                    <p className="text-[10px] text-white">
                      {topic.mastered}/{topic.total} cards
                    </p>
                  </div>
                </Tooltip>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
