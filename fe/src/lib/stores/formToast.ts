import { writable } from 'svelte/store';

export type FormToastVariant = 'success' | 'error';

export type FormToastAction = {
	label: string;
	href: string;
};

export type FormToastState = {
	message: string;
	variant: FormToastVariant;
	actions?: FormToastAction[];
};

function createFormToastStore() {
	const { subscribe, set } = writable<FormToastState | null>(null);

	return {
		subscribe,
		show(
			message: string,
			variant: FormToastVariant = 'success',
			actions?: FormToastAction[]
		) {
			set({ message, variant, actions });
		},
		dismiss() {
			set(null);
		}
	};
}

export const formToastStore = createFormToastStore();
