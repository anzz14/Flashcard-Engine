import { Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";

type StreakTrackerProps = {
  streakCurrent: number;
  streakLongest: number;
};

export default function StreakTracker({
  streakCurrent,
  streakLongest,
}: StreakTrackerProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <Flame className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-900">{streakCurrent} day streak</p>
          <p className="text-sm text-slate-500">Best: {streakLongest} days</p>
          {streakCurrent === 0 ? (
            <p className="pt-1 text-sm font-medium text-orange-600">
              Start studying to build your streak!
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
