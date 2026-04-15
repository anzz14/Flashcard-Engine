"use client";

import Skeleton from "@mui/material/Skeleton";

export default function DeckDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#151515] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width={240} height={46} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton variant="circular" width={34} height={34} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton variant="rounded" width={118} height={36} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton variant="rounded" width={112} height={36} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton variant="rounded" width={88} height={36} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton variant="rounded" width={88} height={36} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton variant="rounded" width={92} height={24} sx={{ bgcolor: "rgba(255,255,255,0.10)" }} />
          <Skeleton variant="rounded" width={76} height={24} sx={{ bgcolor: "rgba(255,255,255,0.10)" }} />
          <Skeleton variant="rounded" width={86} height={24} sx={{ bgcolor: "rgba(255,255,255,0.10)" }} />
          <Skeleton variant="rounded" width={80} height={24} sx={{ bgcolor: "rgba(255,255,255,0.10)" }} />
          <Skeleton variant="rounded" width={66} height={24} sx={{ bgcolor: "rgba(255,255,255,0.10)" }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`stat-${index}`} className="rounded-xl border border-white/10 bg-[#151515] p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton variant="text" width={96} height={24} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
              <Skeleton variant="text" width={44} height={30} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton variant="text" width={180} height={28} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={`topic-${index}`}
              className="rounded-xl border-2 border-white/10 bg-[#151515] p-2.5"
            >
              <div className="space-y-1">
                <Skeleton variant="text" width={68} height={16} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
                <Skeleton variant="text" width={38} height={28} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
                <Skeleton variant="text" width={52} height={14} sx={{ bgcolor: "rgba(255,255,255,0.10)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton variant="text" width={140} height={32} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />

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
                  key={`table-head-${index}`}
                  variant="text"
                  height={24}
                  sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-0 px-4 py-3">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div
                key={`card-row-${rowIndex}`}
                className="grid grid-cols-1 gap-3 border-b border-white/10 py-3 last:border-b-0 md:grid-cols-[1.3fr_1.3fr_0.7fr_0.7fr_0.7fr_0.3fr]"
              >
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <Skeleton
                    key={`card-cell-${rowIndex}-${cellIndex}`}
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