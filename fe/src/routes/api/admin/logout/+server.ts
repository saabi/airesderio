import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSessionCookieName } from '$lib/server/admin-auth.js';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(getSessionCookieName(), { path: '/' });
	throw redirect(302, '/admin/login');
};
