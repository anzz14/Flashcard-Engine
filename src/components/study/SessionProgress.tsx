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
    <div className="space-y-3 rounded-2xl border border-white/10 bg-[#151515] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#ff6a3d]">
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
          sx={{ color: "#ffffff" }}
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
          backgroundColor: "rgba(255,255,255,0.10)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#ff6a3d",
          },
        }}
      />
    </div>
  );
}
