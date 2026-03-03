import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import {
	isAdminEmail,
	verifyAdminPassword,
	createSessionCookie,
	getSessionCookieName,
	getSessionMaxAge
} from '$lib/server/admin-auth.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const data = await request.json();
		const { email, password } = data;

		if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
			return json({ error: 'Correo y contraseña requeridos.' }, { status: 400 });
		}

		const trimmedEmail = email.trim().toLowerCase();

		if (!isAdminEmail(trimmedEmail)) {
			return json({ error: 'Acceso denegado.' }, { status: 403 });
		}

		if (!verifyAdminPassword(password)) {
			return json({ error: 'Contraseña incorrecta.' }, { status: 401 });
		}

		const value = createSessionCookie(trimmedEmail);
		cookies.set(getSessionCookieName(), value, {
			path: '/',
			httpOnly: true,
			secure: import.meta.env.PROD,
			sameSite: 'lax',
			maxAge: getSessionMaxAge()
		});

		return json({ success: true, redirectTo: '/admin/contactos' });
	} catch (err) {
		console.error('Admin login error:', err);
		return json({ error: 'Error al iniciar sesión.' }, { status: 500 });
	}
};
