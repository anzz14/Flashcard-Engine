import pdf from "pdf-parse";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export class PDFExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PDFExtractionError";
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tryExtractPlainTextFallback(buffer: Buffer): string | null {
  const decoded = buffer.toString("utf8");

  // Replace control bytes and high-noise binary bytes with spaces.
  const sanitized = decoded.replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g, " ");
  const normalized = normalizeText(sanitized);

  if (!normalized) {
    return null;
  }

  const wordCount = countWords(normalized);
  if (wordCount < 100) {
    return null;
  }

  // Guard against random binary noise that still tokenizes into "words".
  const alphaChars = (normalized.match(/[A-Za-z]/g) ?? []).length;
  const visibleChars = normalized.replace(/\s+/g, "").length;
  const alphaRatio = visibleChars > 0 ? alphaChars / visibleChars : 0;

  if (alphaRatio < 0.45) {
    return null;
  }

  return normalized;
}

async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text ?? "";
}

async function extractWithPdfJs(buffer: Buffer): Promise<string> {
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const doc = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
    const page = await doc.getPage(pageNo);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string }>;
    const text = items
      .map((item) => (typeof item.str === "string" ? item.str : ""))
      .join(" ");
    pageTexts.push(text);
  }

  return pageTexts.join("\n");
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let rawText = "";
  let parseError: unknown;

  try {
    rawText = await extractWithPdfParse(buffer);
  } catch (error) {
    parseError = error;

    try {
      rawText = await extractWithPdfJs(buffer);
    } catch (pdfJsError) {
      const fallbackText = tryExtractPlainTextFallback(buffer);
      if (fallbackText) {
        return fallbackText;
      }

      const message =
        parseError instanceof Error
          ? parseError.message.toLowerCase()
          : pdfJsError instanceof Error
            ? pdfJsError.message.toLowerCase()
            : "";

      if (message.includes("password") || message.includes("encrypted")) {
        throw new PDFExtractionError(
          "This PDF is encrypted or password-protected. Please unlock it, then upload again."
        );
      }

      throw new PDFExtractionError(
        "Could not read text from this PDF. It may be scanned or image-only. Try pasting text instead."
      );
    }
  }

  const normalizedRaw = normalizeText(rawText);

  const lines = rawText.split(/\r?\n/);

  const withoutPageNumbers = lines.filter(
    (line) => !/^\s*\d+\s*$/.test(line)
  );

  const withoutJunkLines = withoutPageNumbers.filter((line) => line.trim().length >= 2);

  const frequency = new Map<string, number>();
  for (const line of withoutJunkLines) {
    const normalized = line.trim();
    frequency.set(normalized, (frequency.get(normalized) ?? 0) + 1);
  }

  const repeatedHeaderFooterLines = new Set<string>();
  for (const [line, count] of frequency) {
    if (count > 5 && line.length < 90) {
      repeatedHeaderFooterLines.add(line);
    }
  }

  const withoutRepeatedHeadersFooters = withoutJunkLines.filter(
    (line) => !repeatedHeaderFooterLines.has(line.trim())
  );

  const cleanedText = normalizeText(withoutRepeatedHeadersFooters.join("\n"));

  const cleanedWordCount = countWords(cleanedText);
  const rawWordCount = countWords(normalizedRaw);

  if (cleanedWordCount >= 100) {
    return cleanedText;
  }

  // If cleanup removed too much, prefer raw extracted text when it has enough content.
  if (rawWordCount >= 100) {
    return normalizedRaw;
  }

  throw new PDFExtractionError(
    "This PDF contains too little extractable text. It may be scanned or image-only. Try copy-pasting the text instead."
  );
}
