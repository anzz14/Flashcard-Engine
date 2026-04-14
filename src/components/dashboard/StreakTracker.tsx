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
    <Card className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(255,59,0,0.15)] text-[#ff6a3d]">
          <Flame className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-lg font-semibold text-white">{streakCurrent} day streak</p>
            <p className="text-sm text-zinc-400">Best: {streakLongest} days</p>
          </div>
        </div>

        {streakCurrent === 0 ? (
          <p className="shrink-0 text-sm font-medium text-[#ff6a3d]">
            Start studying to build your streak!
          </p>
        ) : null}
      </div>
    </Card>
  );
}
