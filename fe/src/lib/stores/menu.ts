import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// ===== TYPES =====
export type MenuStore = {
	subscribe: (callback: (value: boolean) => void) => () => void;
	open: () => void;
	close: () => void;
	toggle: () => void;
	get isOpen(): boolean;
	cleanup: () => void;
};

// ===== UTILITIES =====
const applyMenuStateToDOM = (isOpen: boolean): void => {
	if (!browser) return;
	if (isOpen) {
		document.body.classList.add('nav-open');
	} else {
		document.body.classList.remove('nav-open');
	}
};

// ===== STORE CREATION =====
function createMenuStore() {
	const { subscribe, set, update } = writable(false);

	let unsubscribe: (() => void) | null = null;

	// Apply CSS class to body when menu state changes
	if (browser) {
		unsubscribe = subscribe((isOpen) => {
			applyMenuStateToDOM(isOpen);
		});
	}

	return {
		subscribe,
		open: () => set(true),
		close: () => set(false),
		toggle: () => update((n) => !n),
		get isOpen() {
			let value = false;
			const unsub = subscribe((v) => {
				value = v;
			});
			unsub();
			return value;
		},
		cleanup: () => {
			if (unsubscribe) {
				unsubscribe();
			}
			// Ensure body class is removed on cleanup
			if (browser) {
				document.body.classList.remove('nav-open');
			}
		}
	} satisfies MenuStore;
}

// ===== EXPORT =====
export const menuStore = createMenuStore();
