import { env } from '$env/dynamic/private';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

function getAdminEmails(): string[] {
	const raw = env.ADMIN_EMAILS ?? '';
	return raw
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}

function getAdminPassword(): string {
	return env.ADMIN_PASSWORD ?? '';
}

function getSessionSecret(): string {
	return env.ADMIN_SESSION_SECRET ?? '';
}

export function isAdminEmail(email: string): boolean {
	return getAdminEmails().includes(email.toLowerCase().trim());
}

export function verifyAdminPassword(password: string): boolean {
	const expected = getAdminPassword();
	if (!expected) return false;
	// Constant-time comparison to prevent timing attacks
	if (Buffer.byteLength(password) !== Buffer.byteLength(expected)) return false;
	try {
		return timingSafeEqual(Buffer.from(password, 'utf8'), Buffer.from(expected, 'utf8'));
	} catch {
		return false;
	}
}

export function createSessionCookie(email: string): string {
	const secret = getSessionSecret();
	if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
	const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
	const payload = `${email.trim().toLowerCase()}:${exp}`;
	const sig = createHmac('sha256', secret).update(payload).digest('hex');
	const value = Buffer.from(`${payload}:${sig}`).toString('base64url');
	return value;
}

export function verifySessionCookie(cookieValue: string): { email: string } | null {
	const secret = getSessionSecret();
	if (!secret) return null;
	try {
		const decoded = Buffer.from(cookieValue, 'base64url').toString('utf8');
		const parts = decoded.split(':');
		if (parts.length !== 3) return null;
		const [email, expStr, sig] = parts;
		const payloadStr = `${email}:${expStr}`;
		const expectedSig = createHmac('sha256', secret).update(payloadStr).digest('hex');
		if (sig.length !== 64 || !timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex')))
			return null;
		const exp = parseInt(expStr, 10);
		if (isNaN(exp) || exp < Date.now() / 1000) return null;
		if (!isAdminEmail(email)) return null;
		return { email };
	} catch {
		return null;
	}
}

export function getSessionCookieName(): string {
	return COOKIE_NAME;
}

export function getSessionMaxAge(): number {
	return SESSION_MAX_AGE;
}
