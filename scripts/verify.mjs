#!/usr/bin/env node
/**
 * Offline integrity check for DressingAtlas.
 * Validates the data schema, trilingual translations, every referenced image
 * file (signature + dimensions) and the page wiring, without a browser.
 */
import { readFile, readdir, stat, open } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warns = [];
const fail = (message) => errors.push(message);

const read = (rel) => readFile(path.join(root, rel), 'utf8');
const exists = async (rel) => {
  try { await stat(path.join(root, rel)); return true; } catch { return false; }
};

/* Data -------------------------------------------------------------------- */
const data = JSON.parse(await read('data/costumes.json'));
const { UI, LANGS } = await import(pathToFileURL(path.join(root, 'assets/js/i18n.js')).href);
const html = await read('index.html');
const appJs = await read('assets/js/app.js');
const source = JSON.parse(await read('scripts/source/costume-db.json'));

if (data.schema !== 1) fail(`Unexpected schema: ${data.schema}`);
if (data.totals.items !== 1407) fail(`Expected 1407 items, got ${data.totals.items}`);
if (data.totals.images !== 2814) fail(`Expected 2814 images, got ${data.totals.images}`);
if (data.totals.categories !== 8) fail(`Expected 8 categories, got ${data.totals.categories}`);
if (data.items.length !== data.totals.items) fail('items.length does not match totals');
if (source.META.total !== data.totals.items) fail('source scrape total does not match data totals');

const categoryKeys = new Set(data.categories.map((category) => category.key));
const countsSum = data.categories.reduce((sum, category) => sum + category.count, 0);
if (countsSum !== data.totals.items) fail(`Category counts sum ${countsSum} != totals.items`);

const sourceCounts = source.META.counts ?? {};
for (const category of data.categories) {
  if (!sourceCounts[category.names.ja]) fail(`Category ${category.key}: ja name not from source site`);
  if (sourceCounts[category.names.ja] !== category.count) {
    fail(`Category ${category.key}: count ${category.count} != source ${sourceCounts[category.names.ja]}`);
  }
}

const seen = new Set(source.D.map((row) => row.id));
const keywordsById = new Map(source.D.map((row) => [row.id, row['キーワード'].trim()]));
const missingIds = [...seen].filter((id) => !data.items.some((item) => item.id === id));
if (missingIds.length) fail(`Items missing vs source scrape: ${missingIds.slice(0, 10).join(', ')}`);

for (const item of data.items) {
  if (seen.size && !seen.has(item.id)) fail(`Unknown item id (not in source): ${item.id}`);
  if (!/^[A-Z]{3}-\d{4}$/.test(item.id)) fail(`Unexpected id format: ${item.id}`);
  if (!categoryKeys.has(item.category)) fail(`${item.id}: unknown category ${item.category}`);
  if (!item.keywords?.trim()) fail(`${item.id}: empty keywords`);
  if (item.keywords !== keywordsById.get(item.id)) fail(`${item.id}: keywords drifted from source`);
  for (const [key, dir, ext] of [['thumb', 'thumbs', '.webp'], ['image', 'img', '.webp'], ['original', 'png', '.png']]) {
    if (item[key] !== `${dir}/${item.category}/${item.id}${ext}`) {
      fail(`${item.id}: unexpected ${key} path ${item[key]}`);
    }
  }
}

/* Translations ------------------------------------------------------------ */
for (const category of data.categories) {
  for (const lang of LANGS) {
    if (!category.names?.[lang]?.trim()) fail(`Category ${category.key} missing ${lang} name`);
  }
  if (!Array.isArray(category.aliases)) fail(`Category ${category.key} missing aliases`);
}

const baseKeys = Object.keys(UI.zh).sort();
for (const lang of LANGS) {
  const keys = Object.keys(UI[lang] ?? {}).sort();
  if (keys.length !== baseKeys.length) fail(`UI.${lang} has ${keys.length} keys, zh has ${baseKeys.length}`);
  for (const key of baseKeys) {
    if (!(key in UI[lang])) fail(`UI.${lang} missing key: ${key}`);
    if (Array.isArray(UI.zh[key]) !== Array.isArray(UI[lang][key])) fail(`UI.${lang}.${key} type mismatch`);
    if (Array.isArray(UI.zh[key]) && UI[lang][key].length !== UI.zh[key].length) {
      fail(`UI.${lang}.${key} list length mismatch`);
    }
  }
}

const i18nPattern = /data-i18n(?:-html|-list|-placeholder|-aria|-alt)?="([^"]+)"/g;
for (const match of html.matchAll(i18nPattern)) {
  if (!(match[1] in UI.zh)) fail(`index.html references missing i18n key: ${match[1]}`);
}

/* Images ------------------------------------------------------------------ */
// The upstream set is not perfectly uniform: most images are 1366 × 2048 and
// a few dozen are slightly smaller (e.g. 1182 × 1774), always portrait 2:3.
// Thumbnails are uniform at 360 × 540.
const THUMB_DIMS = { width: 360, height: 540 };
const IMG_MIN_WIDTH = 1000;
const IMG_ASPECT = 2 / 3;

function webpSize(buffer) {
  if (buffer.subarray(0, 4).toString('ascii') !== 'RIFF') return null;
  if (buffer.subarray(8, 12).toString('ascii') !== 'WEBP') return null;
  const fourcc = buffer.subarray(12, 16).toString('ascii');
  if (fourcc === 'VP8 ') {
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) return null;
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (fourcc === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  return null;
}

let checked = 0;
const imageDims = new Map();
for (const item of data.items) {
  for (const key of ['thumb', 'image']) {
    const rel = item[key];
    if (!(await exists(rel))) { fail(`Missing file: ${rel}`); continue; }
    const info = await stat(path.join(root, rel));
    if (info.size < 1024) { fail(`${rel}: file too small (${info.size}B)`); continue; }
    const handle = await open(path.join(root, rel), 'r');
    const buffer = Buffer.alloc(64);
    await handle.read(buffer, 0, 64, 0);
    await handle.close();
    const dims = webpSize(buffer);
    if (!dims) {
      fail(`${rel}: not a parsable WebP`);
    } else if (key === 'thumb') {
      if (dims.width !== THUMB_DIMS.width || dims.height !== THUMB_DIMS.height) {
        fail(`${rel}: expected ${THUMB_DIMS.width}x${THUMB_DIMS.height} thumb, got ${dims.width}x${dims.height}`);
      }
    } else if (dims.width < IMG_MIN_WIDTH || Math.abs(dims.width / dims.height - IMG_ASPECT) > 0.01) {
      fail(`${rel}: expected portrait 2:3 image at least ${IMG_MIN_WIDTH}px wide, got ${dims.width}x${dims.height}`);
    } else {
      const label = `${dims.width}x${dims.height}`;
      imageDims.set(label, (imageDims.get(label) ?? 0) + 1);
    }
    checked += 1;
  }
}

for (const dir of ['thumbs', 'img']) {
  for (const category of data.categories) {
    const files = await readdir(path.join(root, dir, category.key)).catch(() => null);
    if (!files) { fail(`Missing directory: ${dir}/${category.key}`); continue; }
    const expectedCount = category.count;
    if (files.length !== expectedCount) {
      fail(`${dir}/${category.key}: expected ${expectedCount} files, got ${files.length}`);
    }
  }
}

/* Page & repo wiring ------------------------------------------------------- */
for (const file of ['index.html', 'assets/css/app.css', 'assets/js/app.js', 'assets/js/i18n.js',
  'assets/favicon.svg', 'data/costumes.json', 'scripts/import-data.mjs',
  'scripts/fetch-images.mjs', 'scripts/verify.mjs', 'scripts/source/costume-db.json',
  'package.json', 'README.md', 'LICENSE', '_headers', 'robots.txt', 'og-cover.jpg']) {
  if (!(await exists(file))) fail(`Missing file: ${file}`);
}
for (const preview of ['docs/preview-gallery.jpg', 'docs/preview-modal.jpg', 'docs/preview-mobile.jpg']) {
  if (!(await exists(preview))) warns.push(`Preview not generated yet: ${preview}`);
}

for (const match of appJs.matchAll(/\$\('([A-Za-z]\w*)'\)/g)) {
  if (!html.includes(`id="${match[1]}"`)) fail(`app.js references missing element id: ${match[1]}`);
}
for (const attr of ['data-lang="zh"', 'data-lang="en"', 'data-lang="ja"']) {
  if (!html.includes(attr)) fail(`Language switch incomplete: ${attr} missing`);
}
if (!html.includes('type="module" src="assets/js/app.js"')) fail('app.js not wired as module');
if (/cloudflareinsights|cf-beacon/.test(html)) fail('Original site analytics beacon must not be copied');
if (/support-qr|class="support"/.test(html)) fail('Payment QR/support section must not appear in the site UI');

for (const lang of LANGS) {
  if (!/COSTUME-DB-01/.test(UI[lang].footerCredits) || !/giaaibusi/.test(UI[lang].footerCredits)) {
    fail(`UI.${lang}.footerCredits lacks original author attribution`);
  }
  if (!/HRuiCcc\/RuiC-PoseAtlas/.test(UI[lang].footerCredits)) {
    fail(`UI.${lang}.footerCredits lacks reference project credit`);
  }
}

/* Report ------------------------------------------------------------------- */
if (warns.length) {
  console.log('Warnings:');
  for (const message of warns) console.log('  -', message);
}
if (errors.length) {
  console.error(`\nFAILED with ${errors.length} error(s):`);
  for (const message of errors.slice(0, 40)) console.error('  -', message);
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log(
  `OK · ${data.totals.items} costumes · ${data.totals.images} images checked · ` +
  `${data.totals.categories} categories · ${LANGS.length} languages · ` +
  `${checked} WebP signatures + dimensions verified` +
  (imageDims.size ? ` · image sizes: ${[...imageDims.entries()].sort((a, b) => b[1] - a[1]).map(([dims, count]) => `${dims}×${count}`).join(', ')}` : '')
);
