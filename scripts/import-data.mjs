#!/usr/bin/env node
/**
 * Builds data/costumes.json from the raw scrape of COSTUME-DB-01.
 *
 * Input (shipped for provenance):
 *   scripts/source/costume-db.json  Raw META + records scraped from
 *                                   https://ai-costume-gallery.pages.dev/
 *
 * Adds the stable schema used by the site: trilingual category names,
 * category-scoped image paths and per-category counts. Chinese and English
 * category names are maintained by DressingAtlas; Japanese names come from
 * the original site.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CATEGORIES = [
  { key: 'SPR', ja: '春', zh: '春季', en: 'Spring' },
  { key: 'SUM', ja: '夏', zh: '夏季', en: 'Summer' },
  { key: 'AUT', ja: '秋', zh: '秋季', en: 'Autumn' },
  { key: 'WIN', ja: '冬', zh: '冬季', en: 'Winter' },
  { key: 'LNG', ja: 'ランジェリー', zh: '内衣', en: 'Lingerie' },
  { key: 'PTY', ja: 'パーティ', zh: '派对', en: 'Party' },
  { key: 'SWM', ja: '水着', zh: '泳装', en: 'Swimsuit' },
  { key: 'SXY', ja: 'セクシー', zh: '性感', en: 'Sexy' },
];

/** Extra search aliases per category (kept small; keywords cover the rest). */
const CATEGORY_ALIASES = {
  SPR: ['spring', '春装', '春服', 'はる', 'haru'],
  SUM: ['summer', '夏装', 'なつ', 'natsu'],
  AUT: ['autumn', 'fall', '秋装', 'あき', 'aki'],
  WIN: ['winter', '冬装', 'ふゆ', 'fuyu'],
  LNG: ['lingerie', '睡衣', '内衣', '下着'],
  PTY: ['party', '礼服', '晚礼服', 'パーティードレス'],
  SWM: ['swimsuit', 'swimwear', '泳衣', '水着'],
  SXY: ['sexy', 'セクシー'],
};

const categoryByJa = new Map(CATEGORIES.map((category) => [category.ja, category]));
const errors = [];

const raw = JSON.parse(await readFile(path.join(root, 'scripts/source/costume-db.json'), 'utf8'));
const { META, D } = raw;

if (!META || !Array.isArray(D)) throw new Error('Unexpected source file shape');
if (META.total !== D.length) {
  errors.push(`META.total ${META.total} != records ${D.length}`);
}

const counts = new Map();
const items = [];

for (const row of D) {
  const category = categoryByJa.get(row['カテゴリ']);
  if (!category) {
    errors.push(`${row.id}: unknown category ${row['カテゴリ']}`);
    continue;
  }
  if (!/^[A-Z]{3}-\d{4}$/.test(row.id)) errors.push(`${row.id}: unexpected id format`);
  if (!row['キーワード']?.trim()) errors.push(`${row.id}: missing keywords`);
  for (const field of ['サムネ', '画像', '原寸']) {
    if (!row[field]) errors.push(`${row.id}: missing ${field}`);
  }
  const expectedBase = row.id;
  for (const [field, dir, ext] of [
    ['サムネ', 'thumbs', '.webp'],
    ['画像', 'img', '.webp'],
    ['原寸', 'png', '.png'],
  ]) {
    const expected = `${dir}/${expectedBase}${ext}`;
    if (row[field] && !row[field].endsWith(`${expectedBase}${ext}`)) {
      errors.push(`${row.id}: ${field} path ${row[field]} does not match id`);
    }
  }

  counts.set(category.key, (counts.get(category.key) ?? 0) + 1);
  items.push({
    id: row.id,
    category: category.key,
    keywords: row['キーワード'].trim(),
    thumb: `thumbs/${category.key}/${row.id}.webp`,
    image: `img/${category.key}/${row.id}.webp`,
    original: `png/${category.key}/${row.id}.png`,
  });
}

// Keep the original site's grouping (spring → summer → …) and id order.
const categoryOrder = new Map(CATEGORIES.map((category, index) => [category.key, index]));
items.sort((a, b) =>
  (categoryOrder.get(a.category) - categoryOrder.get(b.category)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
);

const categories = CATEGORIES.map((category) => ({
  key: category.key,
  names: { zh: category.zh, en: category.en, ja: category.ja },
  aliases: CATEGORY_ALIASES[category.key] ?? [],
  count: counts.get(category.key) ?? 0,
}));

const data = {
  schema: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  source:
    'COSTUME-DB-01 (https://ai-costume-gallery.pages.dev/) by ギア (@giaaibusi); ' +
    'zh/en category names and site metadata maintained by DressingAtlas',
  languages: ['zh', 'en', 'ja'],
  spec: {
    thumb: '360 × 540 · WebP',
    image: 'up to 1366 × 2048 · WebP',
    original: '1366 × 2048 · PNG (available from the original site; not stored in this repo)',
  },
  totals: { items: items.length, images: items.length * 2, categories: categories.length },
  categories,
  items,
};

const expectedCounts = META.counts ?? {};
for (const category of categories) {
  const expected = expectedCounts[category.names.ja];
  if (expected !== undefined && expected !== category.count) {
    errors.push(`Category ${category.key}: count ${category.count} != source ${expected}`);
  }
}
const total = categories.reduce((sum, category) => sum + category.count, 0);
if (total !== items.length) errors.push(`Category counts sum ${total} != items ${items.length}`);

if (errors.length) {
  console.error(`import-data failed with ${errors.length} error(s):`);
  for (const error of [...new Set(errors)].slice(0, 30)) console.error('  -', error);
  process.exit(1);
}

await writeFile(path.join(root, 'data/costumes.json'), `${JSON.stringify(data, null, 2)}\n`);
console.log(
  `data/costumes.json written · ${data.totals.items} costumes · ` +
  `${data.totals.images} images · ${data.totals.categories} categories`
);
