import { writable, derived } from 'svelte/store';

export type PdfIntent = 'ficha-tecnica' | 'planos';

export type PdfRequestModalState = {
	intent: PdfIntent;
} | null;

function createPdfRequestModalStore() {
	const { subscribe, set, update } = writable<PdfRequestModalState>(null);

	return {
		subscribe,
		open: (intent: PdfIntent) => set({ intent }),
		close: () => set(null),
		isOpen: derived({ subscribe }, ($state) => $state !== null)
	};
}

export const pdfRequestModalStore = createPdfRequestModalStore();
