import { Card } from "@/components/ui/Card";
import type { DeckWithStats } from "@/types/deck";

type DeckStatsProps = {
  deck: DeckWithStats;
};

type StatItem = {
  label: string;
  value: string;
  valueClassName?: string;
};

export default function DeckStats({ deck }: DeckStatsProps) {
  const stats: StatItem[] = [
    {
      label: "Total Cards",
      value: String(deck.cardCount),
    },
    {
      label: "Due Today",
      value: String(deck.dueToday),
      valueClassName: deck.dueToday > 0 ? "text-[#ff6a3d]" : undefined,
    },
    {
      label: "New Cards",
      value: String(deck.newCount),
    },
    {
      label: "Mastery",
      value: `${deck.masteryPercent}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-white">
              {stat.label}
            </p>
            <p className={`shrink-0 text-lg font-bold leading-none text-[#ff6a3d] ${stat.valueClassName ?? ""}`}>
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
