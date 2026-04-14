"use client";

import type { ReactNode } from "react";

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#151515] px-4 py-12 overflow-hidden">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] p-8 shadow-[0_0_35px_rgba(255,59,0,0.15)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
