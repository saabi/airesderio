#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LUGARES_JSON_PATH = path.resolve(__dirname, '..', 'static', 'lugares', 'lugares-direcciones.json');
const LUGARES_DIR = path.resolve(__dirname, '..', 'static', 'lugares');
const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

async function safeReadDir(dirPath) {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function main() {
  const raw = await fs.readFile(LUGARES_JSON_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data || typeof data !== 'object' || !data.lugares || typeof data.lugares !== 'object') {
    throw new Error('Unexpected JSON structure: missing \'lugares\' root object.');
  }

  let hasMissingDirectories = false;

  for (const [categoryKey, places] of Object.entries(data.lugares)) {
    const categoryDir = path.join(LUGARES_DIR, categoryKey);
    const categoryEntries = await safeReadDir(categoryDir);

    if (!categoryEntries) {
      console.warn(`Category directory missing: ${categoryDir}`);
      hasMissingDirectories = true;
    }

    for (const [placeKey, placeData] of Object.entries(places)) {
      const placeDir = path.join(categoryDir, placeKey);
      const placeEntries = categoryEntries ? await safeReadDir(placeDir) : null;

      if (!placeEntries) {
        console.warn(`Place directory missing: ${placeDir}`);
        placeData.photos = [];
        hasMissingDirectories = true;
        continue;
      }

      // console.log('placeEntries', placeEntries);
      const photos = placeEntries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => VALID_EXTENSIONS.has(path.extname(name).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

      placeData.photos = photos;
    }
  }

  const updatedJson = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(LUGARES_JSON_PATH, updatedJson, 'utf8');

  if (hasMissingDirectories) {
    console.warn('Completed with missing directories. See warnings above.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
