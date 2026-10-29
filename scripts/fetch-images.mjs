#!/usr/bin/env node
/**
 * Downloads every image referenced by data/costumes.json into thumbs/ and img/,
 * and optionally the original-size PNGs from the source site with --png.
 *
 * - Existing valid files are skipped, so it is safe to run repeatedly.
 * - Pass --png to also fetch png/<CAT>/<id>.png (≈1.4 GB in total); those
 *   files are for local offline use and are not committed to the repository.
 *
 * Images © ギア (@giaaibusi) — https://ai-costume-gallery.pages.dev/
 */
import { readFile, writeFile, mkdir, stat, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wantPng = process.argv.includes('--png');
const data = JSON.parse(await readFile(path.join(root, 'data/costumes.json'), 'utf8'));

const sizes = wantPng ? ['thumb', 'image', 'original'] : ['thumb', 'image'];
const files = [...new Set(data.items.flatMap((item) => sizes.map((size) => item[size])))].sort();

const BASE = 'https://ai-costume-gallery.pages.dev/';
const CONCURRENCY = 20;
const ATTEMPTS = 6;
const UA = 'DressingAtlas image fetcher (+https://github.com/kevin96625-coder/DressingAtlas)';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Local layout groups files by category (thumbs/SPR/SPR-0001.webp); the
// upstream site stores them flat (thumbs/SPR-0001.webp).
function remotePath(rel) {
  return `${rel.split('/')[0]}/${path.basename(rel)}`;
}

function signatureValid(rel, buffer) {
  if (buffer.length < 512) return false;
  if (rel.endsWith('.png')) return buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  return buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';
}

async function alreadyValid(rel) {
  try {
    const info = await stat(path.join(root, rel));
    if (info.size < 512) return false;
    const handle = await open(path.join(root, rel), 'r');
    const buffer = Buffer.alloc(512);
    await handle.read(buffer, 0, 512, 0);
    await handle.close();
    return signatureValid(rel, buffer);
  } catch {
    return false;
  }
}

async function download(rel, attempt) {
  // The upstream site serves its SPA HTML with status 200 for unknown paths,
  // so the image signature check below is what actually detects misses.
  const response = await fetch(new URL(remotePath(rel), BASE), {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!signatureValid(rel, buffer)) throw new Error('invalid image signature (SPA fallback page?)');
  const dest = path.join(root, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.part-${process.pid}-${Math.random().toString(36).slice(2)}`;
  await writeFile(tmp, buffer);
  await rename(tmp, dest);
}

let cursor = 0;
let done = 0;
let downloaded = 0;
const failures = [];

async function worker() {
  while (true) {
    const index = cursor;
    cursor += 1;
    if (index >= files.length) return;

    const rel = files[index];
    if (await alreadyValid(rel)) {
      done += 1;
      continue;
    }

    let ok = false;
    let lastError = null;
    for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
      try {
        await download(rel, attempt);
        ok = true;
        downloaded += 1;
        break;
      } catch (error) {
        lastError = error;
        await sleep(800 * (attempt + 1));
      }
    }

    done += 1;
    if (!ok) failures.push(`${rel}: ${lastError?.message ?? 'unknown error'}`);
    if (done % 200 === 0 || done === files.length) {
      console.log(`[fetch] ${done}/${files.length} processed · ${downloaded} downloaded · ${failures.length} failed`);
    }
  }
}

console.log(`[fetch] ${files.length} image paths (${data.totals.items} costumes × ${sizes.length} sizes)${wantPng ? ' · including PNG originals' : ''}`);
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

if (failures.length) {
  console.error(`[fetch] ${failures.length} file(s) failed:`);
  for (const failure of failures.slice(0, 30)) console.error('  -', failure);
  process.exit(1);
}
console.log(`[fetch] complete · ${downloaded} downloaded · ${files.length - downloaded} already present`);
