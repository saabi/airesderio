import { describe, expect, it } from 'vitest';
import { suggestEmailCorrection } from './emailSuggest.js';

describe('suggestEmailCorrection', () => {
	it('suggests gmail.com for gmial.com', () => {
		expect(suggestEmailCorrection('user@gmial.com')).toBe('user@gmail.com');
	});

	it('suggests hotmail.com for hotmial.com', () => {
		expect(suggestEmailCorrection('a@hotmial.com')).toBe('a@hotmail.com');
	});

	it('returns null for a correct common domain', () => {
		expect(suggestEmailCorrection('user@gmail.com')).toBeNull();
	});

	it('returns null for unrelated domains', () => {
		expect(suggestEmailCorrection('user@airesderio.com')).toBeNull();
	});

	it('returns null for incomplete emails', () => {
		expect(suggestEmailCorrection('user@')).toBeNull();
		expect(suggestEmailCorrection('not-an-email')).toBeNull();
	});
});
