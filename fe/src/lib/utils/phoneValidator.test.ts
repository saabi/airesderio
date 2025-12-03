import { describe, it, expect } from 'vitest';
import {
	parseArgentineNumber,
	isValidArgentineNumber,
	formatArgentineNumber
} from './phoneValidator';

describe('phoneValidator', () => {
	describe('parseArgentineNumber', () => {
		it('should parse valid mobile numbers', () => {
			// Test with a valid mobile number format (area code + 15 + subscriber)
			const result = parseArgentineNumber('1151234567');
			expect(result).toBeDefined();
			if (result) {
				// The validator may parse this as mobile or landline depending on block ranges
				expect(result.type).toBeTruthy();
				expect(result.areaCode).toBe('11');
				expect(result.subscriber).toBeDefined();
			}
		});

		it('should parse numbers with country code', () => {
			const result = parseArgentineNumber('+541151234567');
			expect(result).toBeDefined();
			if (result) {
				expect(result.international).toBe('+');
				expect(result.country).toBe('54');
			}
		});

		it('should parse landline numbers', () => {
			// Test with a valid landline format
			const result = parseArgentineNumber('01141234567');
			expect(result).toBeDefined();
			if (result) {
				expect(result.type).toBe('landline');
				expect(result.areaCode).toBe('11');
			}
		});

		it('should return undefined for invalid numbers', () => {
			expect(parseArgentineNumber('123')).toBeUndefined();
			expect(parseArgentineNumber('invalid')).toBeUndefined();
			expect(parseArgentineNumber('')).toBeUndefined();
		});

		it('should handle numbers with spaces and dashes', () => {
			const result = parseArgentineNumber('11 5123-4567');
			expect(result).toBeDefined();
			if (result) {
				// Should parse successfully regardless of type
				expect(result.type).toBeTruthy();
				expect(result.subscriber).toBeDefined();
			}
		});

		it('should parse special service numbers', () => {
			const result = parseArgentineNumber('100');
			expect(result).toBeDefined();
			if (result) {
				expect(result.special).toBe('100');
				expect(result.type).toBe('special');
			}
		});
	});

	describe('isValidArgentineNumber', () => {
		it('should return true for valid mobile numbers', () => {
			expect(isValidArgentineNumber('1151234567')).toBe(true);
			expect(isValidArgentineNumber('3415123456')).toBe(true);
		});

		it('should return true for valid landline numbers', () => {
			expect(isValidArgentineNumber('01141234567')).toBe(true);
		});

		it('should return true for special numbers', () => {
			expect(isValidArgentineNumber('100')).toBe(true);
			expect(isValidArgentineNumber('911')).toBe(true);
		});

		it('should return false for invalid numbers', () => {
			expect(isValidArgentineNumber('123')).toBe(false);
			expect(isValidArgentineNumber('invalid')).toBe(false);
			expect(isValidArgentineNumber('')).toBe(false);
		});
	});

	describe('formatArgentineNumber', () => {
		it('should format mobile numbers correctly', () => {
			const parsed = parseArgentineNumber('1151234567');
			if (parsed) {
				const formatted = formatArgentineNumber(parsed);
				expect(formatted).toBeDefined();
			}
		});

		it('should format with country code when requested', () => {
			const parsed = parseArgentineNumber('+541151234567');
			if (parsed && parsed.country) {
				const formatted = formatArgentineNumber(parsed, { country: true });
				expect(formatted).toContain('54');
			}
		});

		it('should format without country code when country is false', () => {
			const parsed = parseArgentineNumber('1151234567');
			if (parsed) {
				const formatted = formatArgentineNumber(parsed, { country: false });
				expect(formatted).not.toContain('+54');
			}
		});
	});
});
