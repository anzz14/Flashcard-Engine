"use client";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useMemo, useState } from "react";
import GenerationProgress from "@/components/upload/GenerationProgress";
import PDFUploader from "@/components/upload/PDFUploader";
import TextFallback from "@/components/upload/TextFallback";
import UploadErrorBanner from "@/components/upload/UploadErrorBanner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

type BulkAddCardsModalProps = {
  open: boolean;
  deckId: string;
  onClose: () => void;
  onCompleted: (cardCount: number) => void;
};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

async function getErrorMessageFromResponse(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  }

  const text = await response.text();
  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    return "Upload failed on deployed server. Try a smaller PDF (<= 4MB) or paste text instead.";
  }

  return text.slice(0, 200) || fallback;
}

export default function BulkAddCardsModal({
  open,
  deckId,
  onClose,
  onCompleted,
}: BulkAddCardsModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [contentTab, setContentTab] = useState<"pdf" | "text">("pdf");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const textWordCount = useMemo(() => countWords(pastedText), [pastedText]);

  const resetState = () => {
    setStep(1);
    setContentTab("pdf");
    setSelectedFile(null);
    setPastedText("");
    setErrorMessage(null);
    setGenerationError(null);
    setIsStarting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleGenerate = async () => {
    setErrorMessage(null);
    setGenerationError(null);

    if (contentTab === "pdf") {
      if (!selectedFile) {
        setErrorMessage("Please upload a PDF file.");
        return;
      }
    } else if (textWordCount < 100) {
      setErrorMessage("Text too short — need at least 100 words");
      return;
    }

    setIsStarting(true);

    try {
      const formData = new FormData();
      formData.append("deckId", deckId);

      if (contentTab === "pdf" && selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("text", pastedText);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await getErrorMessageFromResponse(
          response,
          "Generation failed — please try again"
        );
        throw new Error(message);
      }

      setStep(2);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Generation failed — please try again"
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Add Cards" maxWidth="md">
      {step === 1 ? (
        <div className="space-y-4 pt-1">
          <Tabs
            value={contentTab}
            onChange={(_, value) => {
              setContentTab(value as "pdf" | "text");
              setErrorMessage(null);
            }}
            sx={{
              borderBottom: "1px solid rgba(255,255,255,0.10)",
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.70)",
              },
              "& .Mui-selected": {
                color: "#ff6a3d !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#ff6a3d",
              },
            }}
          >
            <Tab label="Upload PDF" value="pdf" />
            <Tab label="Paste Text" value="text" />
          </Tabs>

          {contentTab === "pdf" ? (
            <PDFUploader
              disabled={isStarting}
              onFileSelected={(file) => {
                setSelectedFile(file);
                setErrorMessage(null);
              }}
            />
          ) : (
            <TextFallback
              disabled={isStarting}
              onTextChange={(text) => {
                setPastedText(text);
                setErrorMessage(null);
              }}
            />
          )}

          {errorMessage ? (
            <UploadErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isStarting}
              sx={{ color: "#ffffff", "&:hover": { backgroundColor: "transparent" } }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleGenerate()} disabled={isStarting}>
              {isStarting ? <Spinner size="sm" color="#ffffff" /> : "Generate Flashcards"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {generationError ? (
            <>
              <UploadErrorBanner
                message={generationError}
                onDismiss={() => setGenerationError(null)}
              />
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setGenerationError(null);
                    setStep(1);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </>
          ) : (
            <GenerationProgress
              deckId={deckId}
              onComplete={(cardCount) => {
                onCompleted(cardCount);
                handleClose();
              }}
              onError={(msg) => {
                setGenerationError(msg || "Generation failed — please try again");
              }}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
