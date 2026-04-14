"use client";

import { useRouter } from "next/navigation";
import { CreateDeckFlow } from "@/components/deck/CreateDeckModal";

export default function NewDeckPage() {
	const router = useRouter();

	return (
		<div className="mx-auto max-w-3xl space-y-5 py-2">
			<div>
				<h1 className="text-3xl font-bold text-[#ff6a3d]">Create New Deck</h1>
				<p className="mt-1 text-sm text-white">
					Name your deck and add source content to generate flashcards.
				</p>
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<CreateDeckFlow
					showCancel={false}
					onCreated={(deckId) => {
						router.push(`/decks/${deckId}`);
					}}
				/>
			</div>
		</div>
	);
}

