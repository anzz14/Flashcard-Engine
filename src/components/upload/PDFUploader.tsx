"use client";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Alert from "@mui/material/Alert";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/Button";

type PDFUploaderProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

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
      setError("File is too large. Maximum size is 20MB.");
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
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 bg-white"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <DescriptionOutlinedIcon className="mb-2 text-slate-500" />
        <p className="text-sm text-slate-700">Drag and drop your PDF here</p>
        <p className="mt-1 text-xs text-slate-500">Max file size: 20MB</p>

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
        <p className="text-sm text-slate-700">Selected file: {selectedFile.name}</p>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}
    </div>
  );
}
