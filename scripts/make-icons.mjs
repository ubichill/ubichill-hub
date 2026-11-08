/**
 * favicon / apple-touch-icon を src/assets/logo.png から生成する。
 *
 * 本体アプリ（ubichill.com）のアイコンは白地にロゴなので、hub は暗い地にして
 * タブが並んだときに見分けられるようにしている。ロゴを差し替えたら `node scripts/make-icons.mjs`。
 */
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const logo = `${root}src/assets/logo.png`;
const out = `${root}public`;

/** 暗い地（tokens.ts の navy.975 と同じ）に、左上から少しだけ明るい光を入れる */
const background = (size, radius) => {
  const r = Math.round(size * radius);
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="28%" cy="18%" r="95%">
          <stop offset="0" stop-color="#1e2d4f" />
          <stop offset="1" stop-color="#0f1729" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)" />
    </svg>`,
  );
};

/**
 * @param {number} size 出力の一辺
 * @param {number} radius 角丸（一辺に対する比率。iOS は自分で丸めるので 0）
 * @param {number} logoRatio ロゴの高さ（一辺に対する比率）
 * @param {string} file 出力ファイル名
 */
async function make(size, radius, logoRatio, file) {
  const inner = Math.round(size * logoRatio);
  const layer = await sharp(logo).resize({ height: inner, fit: 'inside' }).png().toBuffer();
  const { width = inner, height = inner } = await sharp(layer).metadata();
  await sharp(background(size, radius))
    .composite([{ input: layer, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(`${out}/${file}`);
  console.log(`wrote public/${file} (${size}px)`);
}

await make(256, 0.22, 0.66, 'favicon.png');
await make(180, 0, 0.64, 'apple-touch-icon.png');
