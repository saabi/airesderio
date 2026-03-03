#!/usr/bin/env node

/**
 * Test PostgreSQL database connection and schema.
 * Requires: DATABASE_URL in .env
 *
 * Usage: node scripts/test-db.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const EXPECTED_TABLES = ['leads', 'pdf_access_tokens'];

async function main() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error('Error: DATABASE_URL is not set in .env');
		process.exit(1);
	}

	const safeUrl = url.replace(/:([^@/]+)@/, ':****@');
	console.log('DB test - Aires de Río');
	console.log('  URL:', safeUrl);
	console.log('');

	const pool = new pg.Pool({ connectionString: url });

	try {
		const client = await pool.connect();
		console.log('Connection established.');

		const versionResult = await client.query('SELECT version()');
		console.log('  Server:', versionResult.rows[0].version.split(',')[0]);

		const dbResult = await client.query('SELECT current_database(), current_user');
		console.log('  Database:', dbResult.rows[0].current_database);
		console.log('  User:', dbResult.rows[0].current_user);
		console.log('');

		const tablesResult = await client.query(
			`SELECT table_name FROM information_schema.tables
			 WHERE table_schema = 'public' ORDER BY table_name`
		);
		const tables = tablesResult.rows.map((r) => r.table_name);
		console.log('Tables:', tables.length > 0 ? tables.join(', ') : '(none)');

		const missing = EXPECTED_TABLES.filter((t) => !tables.includes(t));
		if (missing.length > 0) {
			console.warn('  Missing tables:', missing.join(', '));
			console.warn('  Run: npm run db:push');
		} else {
			console.log('  All expected tables exist.');
		}
		console.log('');

		for (const table of EXPECTED_TABLES.filter((t) => tables.includes(t))) {
			const countResult = await client.query(`SELECT count(*) FROM "${table}"`);
			console.log(`  ${table}: ${countResult.rows[0].count} rows`);
		}

		client.release();
		console.log('');
		console.log('Database connection test passed.');
	} catch (err) {
		console.error('Database connection failed:', err.message);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

main();
