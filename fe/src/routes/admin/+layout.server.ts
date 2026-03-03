import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { verifySessionCookie, getSessionCookieName } from '$lib/server/admin-auth.js';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	if (url.pathname === '/admin/login') {
		return {};
	}

	const cookieVal = cookies.get(getSessionCookieName());
	const session = cookieVal ? verifySessionCookie(cookieVal) : null;

	if (!session) {
		throw redirect(302, '/admin/login');
	}

	return { adminEmail: session.email };
};
