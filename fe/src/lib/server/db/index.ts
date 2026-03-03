import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import * as schema from './schema.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
	if (!pool) {
		const url = env.DATABASE_URL;
		if (!url) {
			throw new Error('DATABASE_URL is not set');
		}
		pool = new Pool({ connectionString: url });
	}
	return pool;
}

export function getDb() {
	return drizzle(getPool(), { schema });
}

export { schema };
