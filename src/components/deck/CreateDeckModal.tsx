"use client";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useMemo, useState } from "react";
import GenerationProgress from "@/components/upload/GenerationProgress";
import PDFUploader from "@/components/upload/PDFUploader";
import TextFallback from "@/components/upload/TextFallback";
import UploadErrorBanner from "@/components/upload/UploadErrorBanner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type CreateDeckModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (deckId: string) => void;
};

type CreateDeckFlowProps = {
  onCreated: (deckId: string) => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function CreateDeckFlow({
  onCreated,
  onCancel,
  showCancel = true,
}: CreateDeckFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deckName, setDeckName] = useState("");
  const [contentTab, setContentTab] = useState<"pdf" | "text">("pdf");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdDeckId, setCreatedDeckId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const textWordCount = useMemo(() => countWords(pastedText), [pastedText]);

  const handleGenerate = async () => {
    setErrorMessage(null);
    setGenerationError(null);

    if (!deckName.trim()) {
      setErrorMessage("Please provide a deck name first.");
      setStep(1);
      return;
    }

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
      let deckId = createdDeckId;

      if (!deckId) {
        const createResponse = await fetch("/api/decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: deckName.trim() }),
        });

        const createData = (await createResponse.json()) as { id?: string; error?: string };
        if (!createResponse.ok || !createData.id) {
          throw new Error(createData.error ?? "Failed to create deck");
        }

        deckId = createData.id;
        setCreatedDeckId(deckId);
      }

      const formData = new FormData();
      formData.append("deckId", deckId);

      if (contentTab === "pdf" && selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("text", pastedText);
      }

      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const generateData = (await generateResponse.json()) as { error?: string };
      if (!generateResponse.ok) {
        throw new Error(generateData.error ?? "Generation failed — please try again");
      }

      setStep(3);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed — please try again";
      setErrorMessage(message);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ pt: 1 }}>
      {step === 1 ? (
        <Stack spacing={3}>
          <TextField
            label="Deck name"
            value={deckName}
            onChange={(event) => setDeckName(event.target.value)}
            fullWidth
            autoFocus
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            {showCancel && onCancel ? (
              <Button
                variant="ghost"
                onClick={onCancel}
                sx={{ color: "#ffffff", "&:hover": { backgroundColor: "transparent" } }}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              variant="primary"
              disabled={!deckName.trim()}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </Box>
        </Stack>
      ) : null}

      {step === 2 ? (
        <Stack spacing={3}>
          <Tabs
            value={contentTab}
            onChange={(_, value) => {
              setContentTab(value as "pdf" | "text");
              setErrorMessage(null);
            }}
            sx={{
              "& .MuiTab-root": {
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 600,
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#ff6a3d",
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

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              disabled={isStarting}
              sx={{ color: "#ffffff", "&:hover": { color: "#ffffff", backgroundColor: "transparent" } }}
            >
              Back
            </Button>

            <Button variant="primary" onClick={() => void handleGenerate()} disabled={isStarting}>
              Generate Flashcards
            </Button>
          </Box>
        </Stack>
      ) : null}

      {step === 3 ? (
        <Stack spacing={3}>
          {generationError ? (
            <>
              <UploadErrorBanner
                message={generationError}
                onDismiss={() => setGenerationError(null)}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setGenerationError(null);
                    setStep(2);
                  }}
                >
                  Try Again
                </Button>
              </Box>
            </>
          ) : createdDeckId ? (
            <GenerationProgress
              deckId={createdDeckId}
              onComplete={() => {
                onCreated(createdDeckId);
              }}
              onError={(msg) => {
                setGenerationError(msg || "Generation failed — please try again");
              }}
            />
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}

export default function CreateDeckModal({ open, onClose, onCreated }: CreateDeckModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Create New Deck" maxWidth="md">
      <CreateDeckFlow
        onCreated={(deckId) => {
          onCreated(deckId);
          onClose();
        }}
        onCancel={onClose}
        showCancel
      />
    </Modal>
  );
}
