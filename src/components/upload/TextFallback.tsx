"use client";

import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "@/lib/lucide";

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
        sx={{
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(255,255,255,0.6)",
            opacity: 1,
          },
          "& .MuiInputBase-inputMultiline::-webkit-scrollbar": {
            display: "none",
          },
          "& .MuiOutlinedInput-root": {
            color: "#ffffff",
            backgroundColor: "transparent",
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255,255,255,0.35)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ff6a3d",
            },
          },
        }}
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-white">{wordCount} words</span>
        {wordCount < 100 ? (
          <span className="inline-flex items-center gap-1.5 mt-2 font-medium text-[#ff6a3d]">
            <AlertTriangle className="h-4 w-4 text-white" aria-hidden="true" />
            Need at least 100 words for good card generation
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-medium text-[#ff6a3d]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Ready to generate
          </span>
        )}
      </div>
    </div>
  );
}
