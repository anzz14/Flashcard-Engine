import { CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type DueTodayProps = {
  dueCount: number;
  onClick: () => void;
};

export default function DueToday({ dueCount, onClick }: DueTodayProps) {
  const countColor = dueCount > 0 ? "text-indigo-600" : "text-emerald-600";

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <CalendarCheck2 className="h-4 w-4" />
          <span>Due Today</span>
        </div>

        <div>
          <p className={`text-4xl font-bold ${countColor}`}>{dueCount}</p>
          <p className="text-sm text-slate-500">cards due today</p>
        </div>

        {dueCount === 0 ? (
          <p className="text-sm font-semibold text-emerald-600">🎉 All caught up!</p>
        ) : (
          <Button variant="primary" onClick={onClick}>
            Start Review
          </Button>
        )}
      </div>
    </Card>
  );
}
