import { CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

type DueTodayProps = {
  dueCount: number;
  onClick: () => void;
  loading?: boolean;
};

export default function DueToday({ dueCount, onClick, loading = false }: DueTodayProps) {
  
   

  return (
    <Card className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <CalendarCheck2 className="h-4 w-4 shrink-0 text-[#ff6a3d]" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Due Today</p>
            <p className="text-base text-white">
              <span className={`font-semibold text-[#ff6a3d]`}>{dueCount}</span> cards due today
            </p>
          </div>
        </div>

        {dueCount === 0 ? (
          <p className="shrink-0 text-sm font-semibold text-emerald-400">All caught up!</p>
        ) : (
          <Button variant="primary" size="small" onClick={onClick} disabled={loading}>
            {loading ? <Spinner size="sm" color="#ff6a3d" /> : "Start Review"}
          </Button>
        )}
      </div>
    </Card>
  );
}
