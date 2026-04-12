import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiError";
import { prisma } from "@/lib/prisma";
import { generationEvents } from "@/services/generateCards";
import type { ProgressEvent } from "@/types/generation";

type Props = { params: Promise<{ deckId: string }> };

function toClientEvent(event: {
	status: string;
	doneChunks: number;
	totalChunks: number;
	cardCount?: number;
	errorMessage?: string | null;
	progress?: number;
	message?: string;
}) {
	const computedProgress =
		event.totalChunks > 0
			? Math.round((event.doneChunks / event.totalChunks) * 100)
			: event.status === "DONE"
				? 100
				: 0;

	return {
		status: event.status === "FAILED" ? "ERROR" : event.status,
		doneChunks: event.doneChunks,
		totalChunks: event.totalChunks,
		progress: event.progress ?? computedProgress,
		message:
			event.message ??
			(event.status === "DONE"
				? "Generation complete"
				: event.status === "FAILED"
					? event.errorMessage ?? "Generation failed"
					: "Generation in progress"),
		...(event.cardCount !== undefined ? { cardCount: event.cardCount } : {}),
		...(event.errorMessage ? { error: event.errorMessage, errorMessage: event.errorMessage } : {}),
	};
}

export async function GET(request: Request, { params }: Props) {
	const { userId, error } = await getAuthenticatedUser();
	if (error) return error;

	const { deckId } = await params;

	const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
	if (!deck) return apiError("Deck not found", 404);

	const job = await prisma.generationJob.findUnique({ where: { deckId } });

	if (!job) {
		const body = `data: ${JSON.stringify(toClientEvent({ status: "DONE", cardCount: 0, doneChunks: 0, totalChunks: 0 }))}\n\n`;
		return new Response(body, {
			headers: { "Content-Type": "text/event-stream" },
		});
	}

	if (job.status === "DONE" || job.status === "FAILED") {
		const terminalEvent = toClientEvent({
			status: job.status,
			doneChunks: job.doneChunks,
			totalChunks: job.totalChunks,
			cardCount: job.status === "DONE" ? undefined : undefined,
			...(job.status === "FAILED" ? { errorMessage: job.errorMessage } : {}),
		});
		const body = `data: ${JSON.stringify(terminalEvent)}\n\ndata: [DONE]\n\n`;
		return new Response(body, {
			headers: { "Content-Type": "text/event-stream" },
		});
	}

	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			let closed = false;
			let intervalId: ReturnType<typeof setInterval> | null = null;

			const closeStream = () => {
				if (closed) return;
				closed = true;
				if (intervalId) {
					clearInterval(intervalId);
					intervalId = null;
				}
				generationEvents.off(deckId, onEvent);
				controller.close();
			};

			const sendEvent = (payload: unknown) => {
				if (closed) return;
				const data = `data: ${JSON.stringify(payload)}\n\n`;
				controller.enqueue(encoder.encode(data));
			};

			const initial = `data: ${JSON.stringify(toClientEvent({
				doneChunks: job.doneChunks,
				totalChunks: job.totalChunks,
				status: job.status,
			}))}\n\n`;
			controller.enqueue(encoder.encode(initial));

			function onEvent(event: ProgressEvent) {
				sendEvent(toClientEvent(event));

				if (event.status === "DONE" || event.status === "FAILED") {
					closeStream();
				}
			}

			generationEvents.on(deckId, onEvent);

			const syncJobState = async () => {
				if (closed) return;

				const latest = await prisma.generationJob.findUnique({ where: { deckId } });
				if (!latest) return;

				if (latest.status === "DONE" || latest.status === "FAILED") {
					sendEvent(
						toClientEvent({
							status: latest.status,
							doneChunks: latest.doneChunks,
							totalChunks: latest.totalChunks,
							...(latest.status === "FAILED" ? { errorMessage: latest.errorMessage } : {}),
						})
					);
					closeStream();
				}
			};

			void syncJobState();
			intervalId = setInterval(() => {
				void syncJobState();
			}, 1000);

			request.signal.addEventListener("abort", () => {
				closeStream();
			});
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
