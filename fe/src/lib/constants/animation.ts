export const ANIMATION = {
	threshold: {
		hero: 0.42,
		section: 0.33,
		dense: 0.28
	},
	offset: {
		text: '56px',
		visual: '80px'
	},
	duration: {
		default: '580ms',
		slow: '700ms'
	},
	delay: {
		step: 80
	}
} as const;

export function animationDelay(steps = 0, base = ANIMATION.delay.step) {
	return `${steps * base}ms`;
}

export function animationOffset<K extends keyof typeof ANIMATION.offset>(type: K = 'text' as K) {
	return ANIMATION.offset[type];
}

export function animationDuration<K extends keyof typeof ANIMATION.duration>(
	type: K = 'default' as K
) {
	return ANIMATION.duration[type];
}
