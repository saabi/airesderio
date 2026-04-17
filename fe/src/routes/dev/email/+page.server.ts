import type { PageServerLoad } from './$types';
import {
	buildContactNotificationEmail,
	buildDirectContactThankYouEmail,
	buildPdfDownloadEmail
} from '$lib/server/email';

type EmailPreview = {
	id: string;
	label: string;
	subject: string;
	html: string;
};

export const load: PageServerLoad = async () => {
	const teamNotification = buildContactNotificationEmail({
		leadName: 'María Pérez',
		leadEmail: 'maria@example.com',
		leadPhone: '+54 9 385 612 3456',
		leadMessage: 'Hola, me interesa conocer opciones de financiación.',
		intent: 'direct-contact'
	});

	const pdfLead = buildPdfDownloadEmail({
		leadName: 'Santiago',
		leadEmail: 'santiago@example.com',
		pdfType: 'departamentos',
		token: 'preview-token'
	});

	const thankYouLead = buildDirectContactThankYouEmail({
		leadName: 'Lucía',
		leadEmail: 'lucia@example.com'
	});

	const previews: EmailPreview[] = [
		{
			id: 'team-notification',
			label: 'Notificación interna (equipo)',
			subject: teamNotification.subject,
			html: teamNotification.html
		},
		{
			id: 'pdf-link',
			label: 'Lead: enlace PDF',
			subject: pdfLead.subject,
			html: pdfLead.html
		},
		{
			id: 'thank-you',
			label: 'Lead: agradecimiento',
			subject: thankYouLead.subject,
			html: thankYouLead.html
		}
	];

	return { previews };
};
