/**
 * ビルド後に、トップ・404 で使っている文字だけの M PLUS Rounded 1c を作る（pnpm build から呼ぶ）。
 *
 * fontsource の日本語は unicode-range で 100 前後に分かれていて、トップを開くと数十ファイルを読みに行く。
 * Lighthouse（モバイル）の LCP がそれで数秒遅れるので、ページの文字だけを抜いて 1 ウェイト 1 ファイルにする。
 *
 * - 元のフォント: fonts/MPLUSRounded1c-*.ttf（SIL OFL 1.1、fonts/OFL.txt）
 * - 出力: dist/fonts/mplus-rounded-<weight>.<hash>.woff2
 * - Base.astro が書いた /fonts/mplus-rounded-<weight>.woff2 を、ハッシュ付きの名前に書き換える
 * ドキュメント（/docs/）は Starlight が fontsource をそのまま使うので対象外。
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import subsetFont from 'subset-font';

const DIST = 'dist';
const WEIGHTS = { 400: 'Regular', 700: 'Bold', 800: 'ExtraBold' };

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (relative(DIST, p) === 'docs') continue;
      yield* htmlFiles(p);
    } else if (e.name.endsWith('.html')) {
      yield p;
    }
  }
}

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(
      /&(amp|lt|gt|quot|apos|nbsp);/g,
      (_, n) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[n],
    );

const pages = [];
for await (const f of htmlFiles(DIST)) {
  const html = await readFile(f, 'utf8');
  if (html.includes('/fonts/mplus-rounded-')) pages.push({ f, html });
}
if (pages.length === 0) {
  console.log('[fonts] サブセットを使うページが無い');
  process.exit(0);
}

// 本文の文字（タグ・script・style を除く）と、記号の取りこぼし対策に ASCII 全部・よく使う約物
let text = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
text += '、。・「」『』（）！？ー〜…―　';
for (const { html } of pages) {
  text += decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, ''),
  );
}
const chars = [...new Set(text)].join('');

await mkdir(join(DIST, 'fonts'), { recursive: true });
const renames = {};
for (const [w, name] of Object.entries(WEIGHTS)) {
  const src = await readFile(`fonts/MPLUSRounded1c-${name}.ttf`);
  const out = await subsetFont(src, chars, { targetFormat: 'woff2' });
  const hash = createHash('sha256').update(out).digest('hex').slice(0, 10);
  const file = `mplus-rounded-${w}.${hash}.woff2`;
  await writeFile(join(DIST, 'fonts', file), out);
  renames[`/fonts/mplus-rounded-${w}.woff2`] = `/fonts/${file}`;
  console.log(`[fonts] ${file} ${(out.length / 1024).toFixed(1)} KiB`);
}

for (const { f, html } of pages) {
  let next = html;
  for (const [from, to] of Object.entries(renames)) next = next.replaceAll(from, to);
  await writeFile(f, next);
}
console.log(`[fonts] ${chars.length} 文字、${pages.length} ページを書き換えた`);
