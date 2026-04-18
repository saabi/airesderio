#!/usr/bin/env node

/**
 * Copia de seguridad lógica de la base PostgreSQL indicada en DATABASE_URL.
 * No depende de tablas concretas: vuelca el contenido que pg_dump exporte para esa conexión.
 *
 * Requisitos: PostgreSQL client tools (`pg_dump` en PATH).
 *
 * Uso:
 *   npm run db:backup
 *   npm run db:backup -- ./ruta/personalizada.sql
 *
 * Variables opcionales:
 *   BACKUP_DIR  directorio por defecto para el nombre autogenerado (default: backups dentro de fe/)
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FE_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.resolve(FE_ROOT, '.env'), override: true });

function maskUrl(url) {
	return url.replace(/:([^@/]+)@/, ':****@');
}

function defaultOutputPath() {
	const dir = process.env.BACKUP_DIR
		? path.resolve(FE_ROOT, process.env.BACKUP_DIR)
		: path.join(FE_ROOT, 'backups');
	fs.mkdirSync(dir, { recursive: true });
	const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	return path.join(dir, `airesderio-${stamp}.sql`);
}

function main() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error('Error: DATABASE_URL no está definida (p. ej. en fe/.env).');
		process.exit(1);
	}

	const outArg = process.argv[2];
	const outFile = outArg ? path.resolve(process.cwd(), outArg) : defaultOutputPath();

	const pgDump = spawnSync('pg_dump', ['--version'], { encoding: 'utf8' });
	if (pgDump.status !== 0 || !pgDump.stdout) {
		console.error(
			'Error: no se encontró `pg_dump`. Instalá las herramientas cliente de PostgreSQL (paquete postgresql-client o similar).'
		);
		process.exit(1);
	}

	const args = [
		'-d',
		url,
		'-f',
		outFile,
		'--format=p',
		'--encoding=UTF8',
		'--no-owner',
		'--no-acl',
		'--clean',
		'--if-exists'
	];

	console.log('Copia de seguridad (pg_dump)');
	console.log('  Destino:', outFile);
	console.log('  Origen:', maskUrl(url));
	console.log('');

	const run = spawnSync('pg_dump', args, { stdio: 'inherit' });
	if (run.status !== 0) {
		process.exit(run.status ?? 1);
	}

	const stat = fs.statSync(outFile);
	console.log('');
	console.log('Listo:', `${(stat.size / 1024).toFixed(1)} KiB`);
}

main();
