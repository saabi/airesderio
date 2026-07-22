/** Labels for the “interés en unidad” select (contact + PDF forms). */
export const APARTMENT_INTEREST_OPTIONS = [
	'Departamento de 2 ambientes',
	'Semipisos de 4 ambientes'
] as const;

export type ApartmentInterestOption = (typeof APARTMENT_INTEREST_OPTIONS)[number];

export const APARTMENT_INTEREST_PLACEHOLDER = 'Elegir preferencia…';

export function isApartmentInterestOption(value: string): value is ApartmentInterestOption {
	return (APARTMENT_INTEREST_OPTIONS as readonly string[]).includes(value);
}

/** Blank/missing or unknown → null (reject). */
export function resolveApartmentInterest(raw: unknown): ApartmentInterestOption | null {
	const trimmed = raw == null ? '' : String(raw).trim();
	if (!trimmed) return null;
	return isApartmentInterestOption(trimmed) ? trimmed : null;
}
