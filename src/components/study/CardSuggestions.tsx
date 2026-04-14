"use client";

import Checkbox from "@mui/material/Checkbox";
import { useEffect, useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { Badge, getTopicColor } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type Suggestion = { question: string; answer: string; topicTag: string };

type CardSuggestionsProps = {
  deckId: string;
  onAdded: (count: number) => void;
};

export default function CardSuggestions({ deckId, onAdded }: CardSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId }),
      });
      const data = (await res.json()) as { suggestions?: Suggestion[]; error?: string };
      if (!res.ok) throw new Error(data.error);
      const nextSuggestions = data.suggestions ?? [];
      setSuggestions(nextSuggestions);
      setSelected(new Set(nextSuggestions.map((_, i) => i)));
    } catch {
      setError("Could not load suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSuggestions([]);
    setSelected(new Set());
    setIsLoading(true);
    setIsAdding(false);
    setError(null);
    setAdded(false);
    setAddedCount(0);
    void fetchSuggestions();
  }, [deckId]);

  const handleAdd = async () => {
    setIsAdding(true);
    const picked = suggestions.filter((_, i) => selected.has(i));

    try {
      await Promise.all(
        picked.map((card) =>
          fetch(`/api/decks/${deckId}/cards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(card),
          }).then(async (res) => {
            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              throw new Error(data.error || "Failed to add card");
            }
          })
        )
      );

      setAdded(true);
      setAddedCount(picked.length);
      onAdded(picked.length);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isLoading && suggestions.length === 0 && !error) {
    return null;
  }

  return (
    <Card className="border border-white/10 bg-[#151515] p-5">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-white">
          <Spinner size="sm" />
          <span>Analysing your weak spots...</span>
        </div>
      ) : null}

      {!isLoading && error ? <p className="text-sm text-white">Could not load suggestions</p> : null}

      {!isLoading && !error && added ? (
        <p className="flex items-center gap-2 text-sm font-medium text-white">
          <CheckCircle2 className="h-4 w-4 text-white" aria-hidden="true" />
          <span>{addedCount} cards added to your deck!</span>
        </p>
      ) : null}

      {!isLoading && !error && !added && suggestions.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-white">Suggested Cards</p>
            <p className="text-xs text-white">Based on your weak spots</p>
          </div>

          <div className="space-y-2">
            {suggestions.map((item, index) => {
              const checked = selected.has(index);
              const preview = item.answer.length > 80 ? `${item.answer.slice(0, 80)}...` : item.answer;

              return (
                <button
                  key={`${item.question}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(index)) next.delete(index);
                      else next.add(index);
                      return next;
                    });
                  }}
                  className={cn(
                    "w-full rounded-xl border border-[#ff6a3d]/40 bg-transparent p-3 text-left transition hover:border-[#ff6a3d]/60",
                    checked ? "" : ""
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-1">
                      <Checkbox
                        checked={checked}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onChange={() => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(index)) next.delete(index);
                            else next.add(index);
                            return next;
                          });
                        }}
                        size="small"
                        sx={{
                          color: "#ffffff",
                          "&.Mui-checked": {
                            color: "#ff6a3d",
                          },
                        }}
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-[#ff6a3d]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSuggestion(item);
                            }}
                            className="inline-flex items-center justify-center rounded-md p-0.5 text-white transition hover:bg-white/10 hover:text-white"
                            aria-label="View card details"
                          >
                            <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </button>
                          <span className="truncate">{item.question}</span>
                        </p>
                        <p className="text-xs text-white">{preview}</p>
                      </div>
                    </div>
                    <Badge label={item.topicTag} color={getTopicColor(item.topicTag)} />
                  </div>
                </button>
              );
            })}
          </div>

          {selected.size > 0 ? (
            <div>
              <Button variant="primary" onClick={() => void handleAdd()} disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Spinner size="sm" className="mr-2 text-white" /> Adding...
                  </>
                ) : (
                  `Add ${selected.size} card${selected.size > 1 ? "s" : ""} to deck`
                )}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Modal
        open={activeSuggestion !== null}
        onClose={() => setActiveSuggestion(null)}
        title="Card Details"
        maxWidth="sm"
      >
        {activeSuggestion ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Question</p>
              <p className="mt-1 text-sm text-[#ff6a3d]">{activeSuggestion.question}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Answer</p>
              <p className="mt-1 text-sm leading-relaxed text-white">{activeSuggestion.answer}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Topic</p>
              <div className="mt-1">
                <Badge label={activeSuggestion.topicTag} color={getTopicColor(activeSuggestion.topicTag)} />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
}
