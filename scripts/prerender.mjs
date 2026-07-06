import {
  rm,
  stat,
  rename,
  unlink,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from 'vite';

const DIST = resolve('dist');
const DIST_SSR = resolve('dist-ssr');
const PLACEHOLDER = '<!--app-html-->';

await build({ configFile: 'vite.prerender.config.ts' });

const { render } = await import(
  pathToFileURL(resolve(DIST_SSR, 'entry-server.js')).href
);

const landingPath = resolve(DIST, 'landing.html');
let html = await readFile(landingPath, 'utf8');

if (!html.includes(PLACEHOLDER)) {
  throw new Error(
    `dist/landing.html is missing the ${PLACEHOLDER} placeholder`
  );
}

html = html.replace(PLACEHOLDER, render());

const entryScriptPattern =
  /\s*<script type="module"[^>]*src="(\/assets\/landing[^"]+\.js)"[^>]*><\/script>/;
const entryScriptMatch = html.match(entryScriptPattern);

if (!entryScriptMatch) {
  throw new Error('Could not find the landing entry <script> tag to strip');
}

html = html.replace(entryScriptPattern, '');
html = html.replace(/\s*<link rel="modulepreload"[^>]*>/g, '');

const orphanedAssets = [
  entryScriptMatch[1].slice(1),
  `${entryScriptMatch[1].slice(1)}.map`,
];

for (const asset of orphanedAssets) {
  await unlink(resolve(DIST, asset)).catch(() => {
    return undefined;
  });
}

await rename(resolve(DIST, 'index.html'), resolve(DIST, 'app.html'));
await writeFile(resolve(DIST, 'index.html'), html);
await unlink(landingPath);
await rm(DIST_SSR, { force: true, recursive: true });

const { size } = await stat(resolve(DIST, 'index.html'));

console.warn(
  `Prerendered landing page written to dist/index.html (${(size / 1024).toFixed(1)} kB); SPA shell moved to dist/app.html`
);
