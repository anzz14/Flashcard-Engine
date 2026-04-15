"use client";

import { FileText } from "@/lib/lucide";
import Alert from "@mui/material/Alert";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/Button";

type PDFUploaderProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

// Keep this below typical hosted function request body limits to avoid HTML 413 responses.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export default function PDFUploader({ onFileSelected, disabled = false }: PDFUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size >= MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Maximum size is 4MB for uploads on the deployed app.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileSelected(file);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    validateAndSelect(file);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? "border-[#ff6a3d] bg-[rgba(255,59,0,0.08)]"
            : "border-white/10 bg-transparent"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <FileText className="mb-2 text-[#ff6a3d]" size={22} />
        <p className="text-sm text-white">Drag and drop your PDF here</p>
        <p className="mt-1 text-xs text-white/70">Max file size: 4MB</p>

        <div className="mt-4">
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          hidden
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            validateAndSelect(file);
          }}
        />
      </div>

      {selectedFile ? (
        <p className="text-sm text-white">Selected file: {selectedFile.name}</p>
      ) : null}

      {error ? <Alert severity="error" sx={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#fecaca", border: "1px solid rgba(239,68,68,0.45)" }}>{error}</Alert> : null}
    </div>
  );
}
