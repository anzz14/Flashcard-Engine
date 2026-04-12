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
      valueClassName: deck.dueToday > 0 ? "text-orange-600" : undefined,
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="space-y-1">
            <p className={`text-3xl font-bold text-slate-900 ${stat.valueClassName ?? ""}`}>
              {stat.value}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
