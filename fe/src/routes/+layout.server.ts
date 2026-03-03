import type { LayoutServerLoad } from './$types';
import { verifySessionCookie, getSessionCookieName } from '$lib/server/admin-auth.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const cookieVal = cookies.get(getSessionCookieName());
	const session = cookieVal ? verifySessionCookie(cookieVal) : null;
	return { adminEmail: session?.email ?? null };
};
