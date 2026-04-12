"use client";

import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";

type TextFallbackProps = {
  onTextChange: (text: string) => void;
  disabled?: boolean;
};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export default function TextFallback({ onTextChange, disabled = false }: TextFallbackProps) {
  const [value, setValue] = useState("");
  const wordCount = useMemo(() => countWords(value), [value]);

  return (
    <div className="space-y-2">
      <TextField
        value={value}
        onChange={(event) => {
          const text = event.target.value;
          setValue(text);
          onTextChange(text);
        }}
        disabled={disabled}
        placeholder="Paste your study material here (notes, chapter text, etc.)..."
        multiline
        minRows={12}
        fullWidth
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{wordCount} words</span>
        {wordCount < 100 ? (
          <span className="font-medium text-amber-600">
            ⚠️ Need at least 100 words for good card generation
          </span>
        ) : (
          <span className="font-medium text-emerald-600">✅ Ready to generate</span>
        )}
      </div>
    </div>
  );
}
