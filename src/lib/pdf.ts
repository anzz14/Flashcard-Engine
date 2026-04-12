import pdf from "pdf-parse";

export class PDFExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PDFExtractionError";
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  const rawText = data.text;

  const lines = rawText.split(/\r?\n/);

  const withoutPageNumbers = lines.filter(
    (line) => !/^\s*\d+\s*$/.test(line)
  );

  const withoutJunkLines = withoutPageNumbers.filter(
    (line) => line.trim().length >= 3
  );

  const frequency = new Map<string, number>();
  for (const line of withoutJunkLines) {
    const normalized = line.trim();
    frequency.set(normalized, (frequency.get(normalized) ?? 0) + 1);
  }

  const repeatedHeaderFooterLines = new Set<string>();
  for (const [line, count] of frequency) {
    if (count > 3 && line.length < 80) {
      repeatedHeaderFooterLines.add(line);
    }
  }

  const withoutRepeatedHeadersFooters = withoutJunkLines.filter(
    (line) => !repeatedHeaderFooterLines.has(line.trim())
  );

  let cleanedText = withoutRepeatedHeadersFooters.join("\n");
  cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n");
  cleanedText = cleanedText.replace(/[ \t]{2,}/g, " ");
  cleanedText = cleanedText.trim();

  const wordCount = cleanedText ? cleanedText.split(/\s+/).length : 0;

  if (wordCount < 100) {
    throw new PDFExtractionError(
      "This PDF contains too little text. It may be a scanned document. Try copy-pasting the text instead."
    );
  }

  return cleanedText;
}
