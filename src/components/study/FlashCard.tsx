"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Badge, getTopicColor } from "@/components/ui/Badge";

type FlashCardProps = {
  question: string;
  answer: string;
  topicTag: string | null;
  isFlipped: boolean;
  onFlip: () => void;
};

export default function FlashCard({
  question,
  answer,
  topicTag,
  isFlipped,
  onFlip,
}: FlashCardProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      onFlip();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFlip]);

  const topic = topicTag?.trim() || null;

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: "1200px", minHeight: "280px" }}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label="Flashcard"
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%", minHeight: "280px" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
        >
          {topic && (
            <div className="mb-4">
              <Badge label={topic} color={getTopicColor(topic)} />
            </div>
          )}
          <p className="mb-2 text-sm text-gray-500">Question</p>
          <p className="max-w-2xl whitespace-pre-wrap break-words text-center text-2xl font-medium leading-relaxed text-gray-900">
            {question}
          </p>
          <p className="mt-6 text-sm text-gray-400">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 p-8 shadow-lg"
        >
          {topic && (
            <div className="mb-4">
              <Badge label={topic} color={getTopicColor(topic)} />
            </div>
          )}
          <p className="mb-2 text-sm text-indigo-400">Answer</p>
          <p className="max-w-2xl whitespace-pre-wrap break-words text-center text-xl leading-relaxed text-gray-900">
            {answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}