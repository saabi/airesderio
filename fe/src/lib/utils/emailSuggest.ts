/**
 * Soft email domain typo suggestions (mailcheck-style).
 * Suggests a common domain when the typed domain is close by edit distance.
 */

const COMMON_DOMAINS = [
	'gmail.com',
	'hotmail.com',
	'yahoo.com',
	'outlook.com',
	'icloud.com',
	'live.com',
	'yahoo.com.ar',
	'hotmail.com.ar'
] as const;

const MAX_DISTANCE = 2;

function levenshtein(a: string, b: string): number {
	if (a === b) return 0;
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;

	const prev = new Array<number>(b.length + 1);
	const curr = new Array<number>(b.length + 1);
	for (let j = 0; j <= b.length; j++) prev[j] = j;

	for (let i = 1; i <= a.length; i++) {
		curr[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
		}
		for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
	}
	return prev[b.length];
}

/**
 * If the email's domain looks like a typo of a common provider, returns the
 * corrected full address. Otherwise returns null.
 */
export function suggestEmailCorrection(email: string): string | null {
	const trimmed = email.trim().toLowerCase();
	const at = trimmed.lastIndexOf('@');
	if (at <= 0 || at === trimmed.length - 1) return null;

	const local = trimmed.slice(0, at);
	const domain = trimmed.slice(at + 1);
	if (!local || !domain.includes('.')) return null;

	if ((COMMON_DOMAINS as readonly string[]).includes(domain)) return null;

	let best: string | null = null;
	let bestDist = MAX_DISTANCE + 1;
	for (const candidate of COMMON_DOMAINS) {
		const dist = levenshtein(domain, candidate);
		if (dist > 0 && dist < bestDist && dist <= MAX_DISTANCE) {
			bestDist = dist;
			best = candidate;
		}
	}

	if (!best) return null;
	return `${local}@${best}`;
}
