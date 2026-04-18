#!/usr/bin/env node

/**
 * Restaura un volcado SQL generado con pg_dump (p. ej. `npm run db:backup`).
 * Es genérico: aplica el archivo tal cual contra la base de DATABASE_URL,
 * sin asumir tablas ni columnas concretas.
 *
 * Requisitos: PostgreSQL client tools (`psql` en PATH).
 *
 * Uso:
 *   npm run db:restore -- ./backups/airesderio-2025-01-01T12-00-00.sql
 *   npm run db:restore -- --yes ./copia.sql
 *
 * La restauración puede borrar objetos si el dump incluye --clean (como en db:backup).
 * Por defecto pide confirmación escribiendo "RESTAURAR"; use --yes para automatizar (CI/ops).
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FE_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.resolve(FE_ROOT, '.env'), override: true });

function maskUrl(url) {
	return url.replace(/:([^@/]+)@/, ':****@');
}

function parseArgs(argv) {
	let yes = false;
	const rest = [];
	for (const a of argv) {
		if (a === '--yes' || a === '-y') yes = true;
		else rest.push(a);
	}
	return { yes, file: rest[0] };
}

function askConfirm() {
	return new Promise((resolve) => {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
		rl.question(
			'Esto ejecutará el SQL contra la base actual y puede eliminar datos. Escribí RESTAURAR para continuar: ',
			(answer) => {
				rl.close();
				resolve(answer.trim() === 'RESTAURAR');
			}
		);
	});
}

async function main() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error('Error: DATABASE_URL no está definida (p. ej. en fe/.env).');
		process.exit(1);
	}

	const { yes, file: rawPath } = parseArgs(process.argv.slice(2));
	if (!rawPath) {
		console.error('Uso: npm run db:restore -- [--yes] <archivo.sql>');
		console.error('Ejemplo: npm run db:restore -- ./backups/airesderio-2025-04-17T12-00-00.sql');
		process.exit(1);
	}

	const sqlPath = path.resolve(process.cwd(), rawPath);
	if (!fs.existsSync(sqlPath) || !fs.statSync(sqlPath).isFile()) {
		console.error('Error: no existe el archivo:', sqlPath);
		process.exit(1);
	}

	const psqlCheck = spawnSync('psql', ['--version'], { encoding: 'utf8' });
	if (psqlCheck.status !== 0 || !psqlCheck.stdout) {
		console.error(
			'Error: no se encontró `psql`. Instalá las herramientas cliente de PostgreSQL (paquete postgresql-client o similar).'
		);
		process.exit(1);
	}

	if (!yes) {
		console.log('Restauración de base de datos');
		console.log('  Archivo:', sqlPath);
		console.log('  Destino:', maskUrl(url));
		console.log('');
		const ok = await askConfirm();
		if (!ok) {
			console.log('Cancelado.');
			process.exit(0);
		}
	} else {
		console.log('Restauración (--yes):', sqlPath, '→', maskUrl(url));
	}

	const args = ['-d', url, '-v', 'ON_ERROR_STOP=1', '-f', sqlPath];

	const run = spawnSync('psql', args, { stdio: 'inherit' });
	if (run.status !== 0) {
		process.exit(run.status ?? 1);
	}

	console.log('');
	console.log('Restauración finalizada.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
