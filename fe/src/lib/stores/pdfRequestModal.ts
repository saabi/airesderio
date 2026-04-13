import { writable, derived } from 'svelte/store';

/** Single PDF for all request CTAs: `static/pdf/Aires de Río - Ficha técnica.pdf` */
export type PdfIntent = 'departamentos';

/** Which CTA opened the modal (used for analytics IDs on the submit button). */
export type PdfRequestSource = 'harmony' | 'luxury' | 'footer' | 'planos';

export type PdfRequestModalState = {
	intent: PdfIntent;
	source: PdfRequestSource;
} | null;

function createPdfRequestModalStore() {
	const { subscribe, set, update } = writable<PdfRequestModalState>(null);

	return {
		subscribe,
		open: (intent: PdfIntent, source: PdfRequestSource) => set({ intent, source }),
		close: () => set(null),
		isOpen: derived({ subscribe }, ($state) => $state !== null)
	};
}

export const pdfRequestModalStore = createPdfRequestModalStore();
