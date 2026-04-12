import type { Chunk } from "../types/generation";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

function isHeadingParagraph(paragraph: string): boolean {
  const trimmed = paragraph.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.length >= 100) {
    return false;
  }

  if (/[\.,:]$/.test(trimmed)) {
    return false;
  }

  const sentenceMarkers = trimmed.match(/(?:\. |\? |! )/g);
  const sentenceCount = sentenceMarkers ? sentenceMarkers.length + 1 : 1;
  if (sentenceCount > 2) {
    return false;
  }

  return true;
}

function splitLargeParagraph(paragraph: string, limit: number): string[] {
  const sentences = paragraph
    .trim()
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return [];
  }

  const parts: string[] = [];
  let current = "";
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);

    if (sentenceWords > limit) {
      if (current) {
        parts.push(current.trim());
        current = "";
        currentWords = 0;
      }

      const words = sentence.split(/\s+/);
      for (let i = 0; i < words.length; i += limit) {
        parts.push(words.slice(i, i + limit).join(" "));
      }
      continue;
    }

    if (currentWords + sentenceWords > limit) {
      parts.push(current.trim());
      current = sentence;
      currentWords = sentenceWords;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
      currentWords += sentenceWords;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function createChunk(heading: string, content: string): Chunk {
  const cleanContent = content.trim();
  return {
    heading,
    content: cleanContent,
    wordCount: countWords(cleanContent),
  };
}

export function splitIntoChunks(text: string): Chunk[] {
  const normalizedText = text.replace(/\n{3,}/g, "\n\n").trim();
  const totalWords = countWords(normalizedText);

  if (!normalizedText) {
    return [];
  }

  if (totalWords < 200) {
    return [
      {
        heading: "Content",
        content: normalizedText,
        wordCount: totalWords,
      },
    ];
  }

  const rawParagraphs = normalizedText
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const hasDetectableHeadings = rawParagraphs.some((paragraph) =>
    isHeadingParagraph(paragraph)
  );

  let currentHeading = "Introduction";
  let sectionIndex = 1;
  const chunks: Chunk[] = [];

  for (let i = 0; i < rawParagraphs.length; i += 1) {
    const paragraph = rawParagraphs[i];

    if (isHeadingParagraph(paragraph)) {
      currentHeading = paragraph;
      continue;
    }

    let content = paragraph;
    let wordCount = countWords(content);
    let chunkHeading = currentHeading;

    if (!hasDetectableHeadings) {
      chunkHeading = `Section ${sectionIndex}`;
      sectionIndex += 1;
    }

    if (wordCount < 60) {
      let mergedWithNext = false;

      for (let j = i + 1; j < rawParagraphs.length; j += 1) {
        const nextParagraph = rawParagraphs[j];

        if (isHeadingParagraph(nextParagraph)) {
          currentHeading = nextParagraph;
          continue;
        }

        content = `${content}\n\n${nextParagraph}`;
        wordCount = countWords(content);
        i = j;
        mergedWithNext = true;
        break;
      }

      if (!mergedWithNext) {
        chunks.push(createChunk(chunkHeading, content));
        continue;
      }
    }

    if (wordCount > 800) {
      const parts = splitLargeParagraph(content, 800);
      for (const part of parts) {
        if (part.trim()) {
          chunks.push(createChunk(chunkHeading, part));
        }
      }
      continue;
    }

    chunks.push(createChunk(chunkHeading, content));
  }

  return chunks.filter((chunk) => chunk.content.trim().length > 0);
}
