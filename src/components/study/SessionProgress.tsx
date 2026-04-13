"use client";

import { X } from "@/lib/lucide";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { Badge, getTopicColor } from "@/components/ui/Badge";

type SessionProgressProps = {
  currentIndex: number;
  total: number;
  topicTag: string | null;
  onExit: () => void;
};

export default function SessionProgress({
  currentIndex,
  total,
  topicTag,
  onExit,
}: SessionProgressProps) {
  const safeTotal = total > 0 ? total : 1;
  const clampedCurrent = Math.max(0, Math.min(currentIndex, safeTotal));
  const percent = Math.round((clampedCurrent / safeTotal) * 100);

  const topic = topicTag?.trim() || null;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">
            Card {clampedCurrent} of {total}
          </p>
          {topic ? <Badge label={topic} color={getTopicColor(topic)} /> : null}
        </div>

        <IconButton
          aria-label="Exit session"
          onClick={() => {
            onExit();
          }}
          size="small"
        >
          <X size={18} />
        </IconButton>
      </div>

      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 10,
          borderRadius: 9999,
          backgroundColor: "#e2e8f0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#6366f1",
          },
        }}
      />
    </div>
  );
}
