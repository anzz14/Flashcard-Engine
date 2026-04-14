"use client";

import { useEffect, useState } from "react";

type GenerationStatus = "IDLE" | "PROCESSING" | "DONE" | "FAILED" | "ERROR";

type GenerationProgressState = {
  doneChunks: number;
  totalChunks: number;
  status: GenerationStatus;
  cardCount: number;
  errorMessage: string | null;
};

const initialState: GenerationProgressState = {
  doneChunks: 0,
  totalChunks: 0,
  status: "IDLE",
  cardCount: 0,
  errorMessage: null,
};

type IncomingEvent = {
  doneChunks?: number;
  totalChunks?: number;
  status?: string;
  cardCount?: number;
  error?: string;
  errorMessage?: string;
};

export function useGenerationProgress({
  deckId,
}: {
  deckId: string | null;
}): GenerationProgressState {
  const [state, setState] = useState<GenerationProgressState>(initialState);

  useEffect(() => {
    if (!deckId) {
      setState(initialState);
      return;
    }

    const source = new EventSource(`/api/progress/${deckId}`);

    source.onmessage = (event) => {
      if (event.data === "[DONE]") {
        source.close();
        return;
      }

      try {
        const data = JSON.parse(event.data) as IncomingEvent;
        const statusRaw = (data.status ?? "PROCESSING").toUpperCase();
        const status: GenerationStatus =
          statusRaw === "DONE"
            ? "DONE"
            : statusRaw === "FAILED"
              ? "FAILED"
              : statusRaw === "ERROR"
                ? "ERROR"
                : "PROCESSING";

        setState({
          doneChunks: data.doneChunks ?? 0,
          totalChunks: data.totalChunks ?? 0,
          status,
          cardCount: data.cardCount ?? 0,
          errorMessage: data.errorMessage ?? data.error ?? null,
        });

        if (status === "DONE" || status === "FAILED" || status === "ERROR") {
          source.close();
        }
      } catch {
        setState((prev) => ({
          ...prev,
          status: "ERROR",
          errorMessage: "Invalid progress stream response",
        }));
        source.close();
      }
    };

    source.onerror = () => {
      setState((prev) => ({
        ...prev,
        status: "ERROR",
        errorMessage: prev.errorMessage ?? "Progress connection lost",
      }));
      source.close();
    };

    return () => {
      source.close();
    };
  }, [deckId]);

  return state;
}
