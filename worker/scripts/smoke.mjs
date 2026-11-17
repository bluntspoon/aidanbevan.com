#!/usr/bin/env node
// Post a photo to a running Car-dex API and print what it answered.
//   node scripts/smoke.mjs http://localhost:8787 polo.jpg
import { readFile } from 'node:fs/promises';

const [endpoint, file] = process.argv.slice(2);
if (!endpoint || !file) {
  console.error('usage: node scripts/smoke.mjs <api-base-url> <photo.jpg>');
  process.exit(2);
}

const bytes = await readFile(file);
const image = `data:image/jpeg;base64,${bytes.toString('base64')}`;
const started = Date.now();
const response = await fetch(new URL('/api/identify', endpoint), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image }),
});
console.log(`${response.status} in ${Date.now() - started} ms`);
console.log(JSON.stringify(await response.json(), null, 2));
