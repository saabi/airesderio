import { writable, derived } from 'svelte/store';

/** Single PDF for all request CTAs: `static/pdf/AiresDeRioDepartamentos.pdf` */
export type PdfIntent = 'departamentos';

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
