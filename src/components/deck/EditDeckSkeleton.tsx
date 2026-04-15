"use client";

import Skeleton from "@mui/material/Skeleton";

type EditDeckSkeletonProps = {
  deckCardCount: number;
};

export default function EditDeckSkeleton({ deckCardCount }: EditDeckSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" width={130} height={36} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
      </div>

      <Skeleton variant="text" width={140} height={24} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />

      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#151515] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
          </div>
          <Skeleton variant="rounded" width={120} height={40} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151515]">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={`edit-table-head-${index}`}
                  variant="text"
                  height={24}
                  sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-0 px-4 py-3">
            {Array.from({ length: Math.min(6, Math.max(3, Math.ceil(deckCardCount / 4))) }).map((_, rowIndex) => (
              <div
                key={`edit-card-row-${rowIndex}`}
                className="grid grid-cols-1 gap-3 border-b border-white/10 py-3 last:border-b-0 md:grid-cols-[1.3fr_1.3fr_0.7fr_0.7fr_0.7fr_0.3fr]"
              >
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <Skeleton
                    key={`edit-card-cell-${rowIndex}-${cellIndex}`}
                    variant="text"
                    height={28}
                    sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}