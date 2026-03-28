import { writable } from 'svelte/store';

export type FormToastVariant = 'success' | 'error';

export type FormToastState = {
	message: string;
	variant: FormToastVariant;
};

function createFormToastStore() {
	const { subscribe, set } = writable<FormToastState | null>(null);

	return {
		subscribe,
		show(message: string, variant: FormToastVariant = 'success') {
			set({ message, variant });
		},
		dismiss() {
			set(null);
		}
	};
}

export const formToastStore = createFormToastStore();
