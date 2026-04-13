"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type HintBoxProps = {
  cardId: string;
  question: string;
  answer: string;
};

export default function HintBox({ cardId, question, answer }: HintBoxProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setHint(null);
    setIsLoading(false);
    setError(null);
    setIsVisible(false);
  }, [cardId]);

  const fetchHint = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, question, answer }),
      });
      const data = (await response.json()) as { hint?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to get hint");
      setHint(data.hint ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate hint");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        onClick={() => {
          setIsLoading(true);
          setIsVisible(true);
          void fetchHint();
        }}
      >
        💡 Give me a hint
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold text-amber-700">💡 Hint</div>

      {isLoading ? (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-amber-600">
          <Spinner size="sm" />
          <span>Thinking...</span>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="ghost" onClick={() => void fetchHint()} sx={{ p: 0, minWidth: 0 }}>
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && hint ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{hint}</p>
      ) : null}
    </div>
  );
}
