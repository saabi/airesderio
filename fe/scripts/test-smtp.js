#!/usr/bin/env node

/**
 * Test SMTP configuration by sending a test email.
 * Requires: SMTP_HOST, SMTP_USER, SMTP_PASS in .env
 * Optional: SMTP_PORT, SMTP_SECURE, CONTACT_FORM_FROM, CONTACT_FORM_RECIPIENT
 *
 * Usage: node scripts/test-smtp.js [--to=email@example.com] [--587] [--debug]
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

function parseArgs() {
	const toArg = process.argv.find((a) => a.startsWith('--to='));
	const port587 = process.argv.includes('--587');
	const port465 = process.argv.includes('--465');
	const debug = process.argv.includes('--debug');
	return { to: toArg ? toArg.slice(5) : null, port587, port465, debug };
}

async function main() {
	const { to, port587, port465, debug } = parseArgs();
	const host = process.env.SMTP_HOST;
	let port = parseInt(process.env.SMTP_PORT ?? '465', 10);
	// Port 587 uses STARTTLS (plain then upgrade), never implicit SSL
	let secure = port === 465 ? process.env.SMTP_SECURE !== 'false' : false;
	if (port587) {
		port = 587;
		secure = false;
		console.log('Using port 587 (STARTTLS)...');
	} else if (port465) {
		port = 465;
		secure = true;
		console.log('Using port 465 (SSL)...');
	}
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const from = process.env.CONTACT_FORM_FROM || user || 'noreply@example.com';
	const defaultTo = process.env.CONTACT_FORM_RECIPIENT || user;
	const recipient = to || defaultTo;

	if (!host || !user || !pass) {
		console.error('Error: SMTP configuration missing.');
		console.error('Required in .env: SMTP_HOST, SMTP_USER, SMTP_PASS');
		console.error('Optional: SMTP_PORT (default 465), SMTP_SECURE (default true for 465)');
		process.exit(1);
	}

	if (!recipient) {
		console.error('Error: No recipient. Set CONTACT_FORM_RECIPIENT in .env or use --to=email@example.com');
		process.exit(1);
	}

	console.log('SMTP test - Aires de Río');
	console.log('  Host:', host);
	console.log('  Port:', port);
	console.log('  User:', user);
	console.log('  From:', from);
	console.log('  To:', recipient);
	console.log('  Password length:', pass?.length ?? 0, pass?.includes('*') || pass?.includes('secret') ? '(contains * or "secret" - check for placeholder!)' : '');
	console.log('');

	const transporter = nodemailer.createTransport({
		host,
		port,
		secure,
		auth: { user, pass },
		logger: debug,
		debug: debug
	});

	try {
		await transporter.verify();
		console.log('SMTP connection verified.');
	} catch (err) {
		console.error('SMTP connection failed:', err.message);
		process.exit(1);
	}

	const testEmail = {
		from,
		to: recipient,
		subject: '[Test] Aires de Río - SMTP Configuration',
		html: `
			<h2>SMTP Test</h2>
			<p>If you receive this email, the SMTP configuration for Aires de Río is working correctly.</p>
			<p><small>Sent at ${new Date().toISOString()}</small></p>
		`,
		text: 'If you receive this email, the SMTP configuration for Aires de Río is working correctly.'
	};

	try {
		const info = await transporter.sendMail(testEmail);
		console.log('Test email sent successfully.');
		console.log('  Message ID:', info.messageId);
	} catch (err) {
		console.error('Failed to send test email:', err.message);
		process.exit(1);
	}
}

main();
