"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { useGenerationProgress } from "@/hooks/useGenerationProgress";

type GenerationProgressProps = {
  deckId: string;
  onComplete: (cardCount: number) => void;
  onError: (msg: string) => void;
};

const loadingMessages = [
  "Analyzing your content...",
  "Identifying key concepts...",
  "Writing questions like a great teacher...",
  "Adding edge cases and examples...",
];

export default function GenerationProgress({
  deckId,
  onComplete,
  onError,
}: GenerationProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const { doneChunks, totalChunks, status, cardCount, errorMessage } = useGenerationProgress({
    deckId,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((index) => (index + 1) % loadingMessages.length);
    }, 1800);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (status === "DONE") {
      onComplete(cardCount);
    }

    if (status === "FAILED" || status === "ERROR") {
      onError(errorMessage ?? "Generation failed");
    }
  }, [cardCount, errorMessage, onComplete, onError, status]);

  const label = useMemo(
    () => `${doneChunks} of ${totalChunks} sections`,
    [doneChunks, totalChunks]
  );

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#ff6a3d]">Generating flashcards...</h3>

      <ProgressBar value={doneChunks} max={totalChunks} label={label} />

      <p className="text-sm text-white">{loadingMessages[messageIndex]}</p>
    </div>
  );
}
