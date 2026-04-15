import { extractText } from "unpdf";

// Polyfill for Promise.try (Node < 22)
if (!Promise.try) {
  (Promise as any).try = function <T>(fn: () => T | Promise<T>): Promise<T> {
    return Promise.resolve().then(fn);
  };
}

export class PDFExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PDFExtractionError";
  }
}

async function tryUnpdf(buffer: Buffer): Promise<string> {
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  });

  console.log("[PDF Extract] unpdf result:", {
    textType: typeof text,
    isArray: Array.isArray(text),
    textLength: Array.isArray(text) ? text.length : (text as string)?.length,
    totalPages,
  });

  const extractedText = Array.isArray(text) ? text.join("\n") : text;

  if (!extractedText?.trim()) {
    throw new PDFExtractionError("unpdf returned empty text");
  }

  return extractedText.trim();
}

// Fallback: pdfjs-dist for edge cases unpdf can't handle
async function tryPdfJs(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const { getDocument } = pdfjs;

    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      disableWorker: true,
      isEvalSupported: false,
    } as any);

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

    const extracted = pageTexts.join("\n").trim();
    if (extracted) {
      console.log("[PDF Extract] pdfjs fallback succeeded");
      return extracted;
    }

    throw new Error("pdfjs also returned empty text");
  } catch (err) {
    console.error("[PDF Extract] pdfjs fallback failed:", err);
    throw new PDFExtractionError("Could not read this PDF with either extractor");
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Try unpdf first (faster, ESM-native)
    return await tryUnpdf(buffer);
  } catch (error) {
    console.error("[PDF Extract] unpdf failed, trying pdfjs fallback:", {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    });

    try {
      // Fallback: try pdfjs-dist for edge cases
      return await tryPdfJs(buffer);
    } catch (fallbackError) {
      if (fallbackError instanceof PDFExtractionError) throw fallbackError;

      console.error("[PDF Extract] Both extractors failed:", fallbackError);
      throw new PDFExtractionError("Could not read this PDF. Try pasting text instead.");
    }
  }
}
