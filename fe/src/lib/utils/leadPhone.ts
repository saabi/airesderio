/** Minimum digits for a lead phone (country + subscriber), used by public forms and /api/contact */
const MIN_LEAD_PHONE_DIGITS = 10;

export function isLeadPhoneFilled(telefono: string): boolean {
	const digits = telefono.replace(/\D/g, '');
	return digits.length >= MIN_LEAD_PHONE_DIGITS;
}
