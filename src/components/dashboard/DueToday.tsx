import { CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type DueTodayProps = {
  dueCount: number;
  onClick: () => void;
};

export default function DueToday({ dueCount, onClick }: DueTodayProps) {
  const countColor =
    dueCount < 3 ? "text-emerald-600" : dueCount < 10 ? "text-amber-500" : "text-indigo-600";

  return (
    <Card className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <CalendarCheck2 className="h-4 w-4 shrink-0 text-slate-600" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-600">Due Today</p>
            <p className="text-base text-slate-500">
              <span className={`font-semibold ${countColor}`}>{dueCount}</span> cards due today
            </p>
          </div>
        </div>

        {dueCount === 0 ? (
          <p className="shrink-0 text-sm font-semibold text-emerald-600">All caught up!</p>
        ) : (
          <Button variant="primary" size="small" onClick={onClick}>
            Start Review
          </Button>
        )}
      </div>
    </Card>
  );
}
