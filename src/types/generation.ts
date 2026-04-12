export type JobStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

export interface ProgressEvent {
  doneChunks: number;
  totalChunks: number;
  status: JobStatus;
  cardCount?: number;
  errorMessage?: string;
}

export interface Chunk {
  heading: string;
  content: string;
  wordCount: number;
}
