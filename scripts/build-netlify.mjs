import {cp, mkdir, rm} from 'node:fs/promises';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export async function buildNetlify({outDir = join(root, 'dist/netlify')} = {}) {
  await rm(outDir, {recursive: true, force: true});
  await mkdir(outDir, {recursive: true});
  await cp(join(root, 'landing'), outDir, {recursive: true});
  await cp(join(root, 'prototype/web'), join(outDir, 'app'), {recursive: true});
  // Unlike the Pages build, keep /api/config and /api/analyze live.
  // Fonts, model and WASM assets are served locally by Netlify's CDN.
  return outDir;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log('Netlify static files ready:', await buildNetlify());
}
