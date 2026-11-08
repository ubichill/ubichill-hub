/**
 * ubichill.com の公開ワールド一覧。
 *
 * ビルド時に `GET {UBICHILL_API}/api/v1/worlds` を 1 回だけ取りに行き、届かなければ
 * `worlds.fallback.json`（取得できたときの形をそのまま保存したもの）を使う。
 * 本番の API は CORS を ubichill.com にしか開けていないので、ブラウザからは取りに行かない。
 * 一覧を新しくするにはビルドし直す（Cloudflare Pages の Deploy Hook を毎日叩く）。
 *
 * 本体側の定義: packages/shared/src/schemas/instance.schema.ts の WorldListItem。
 */
import fallback from './worlds.fallback.json';

export interface WorldListItem {
  /** ワールド定義の URL（一意） */
  url: string;
  source: { kind: string; url: string; registryName?: string; originInstance?: string };
  id: string;
  displayName: string;
  description?: string;
  /** 作者が YAML の spec.thumbnail に書いた絶対 URL。無いことが多い */
  thumbnail?: string;
  version: string;
  capacity: { default: number; max: number };
  authorId?: string;
  authorName?: string;
  mods: { id: string; version?: string }[];
  identity?: {
    status: string;
    /** `acct:handle@host/name` */
    worldId?: string;
    /** `handle@host` */
    author?: string;
    publicKey?: string;
    contentHash?: string;
  };
  sharePath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorldsResult {
  worlds: WorldListItem[];
  /** live: API から取れた / fallback: 保存してある JSON を使った */
  source: 'live' | 'fallback';
  fetchedAt: string | null;
}

/** いまは公式サーバーだけ。連合サーバーの一覧 API ができたらここを配列にする */
export const API_ORIGIN = (process.env.UBICHILL_API ?? 'https://ubichill.com').replace(/\/$/, '');

let cache: Promise<WorldsResult> | undefined;

/** ビルド中は何度呼んでも 1 回しか取りに行かない */
export function getWorlds(): Promise<WorldsResult> {
  cache ??= load();
  return cache;
}

async function load(): Promise<WorldsResult> {
  const url = `${API_ORIGIN}/api/v1/worlds`;
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'ubichill-hub build (+https://hub.ubichill.com/)' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { worlds?: unknown };
    if (!Array.isArray(json.worlds)) throw new Error('worlds が配列ではない');
    console.log(`[worlds] ${url} から ${json.worlds.length} 件`);
    return { worlds: json.worlds as WorldListItem[], source: 'live', fetchedAt: new Date().toISOString() };
  } catch (e) {
    console.warn(`[worlds] ${url} から取れなかったので src/data/worlds.fallback.json を使う: ${String(e)}`);
    return { worlds: fallback.worlds as WorldListItem[], source: 'fallback', fetchedAt: null };
  }
}

/** ワールド定義が置いてあるホスト（ubichill.com / yokan.github.io …） */
export function worldHost(w: WorldListItem): string {
  try {
    return new URL(w.url).host;
  } catch {
    return API_ORIGIN.replace(/^https?:\/\//, '');
  }
}

/** 作者の表示。署名があれば `@handle@host`、無ければ表示名 */
export function worldAuthor(w: WorldListItem): string {
  if (w.identity?.author) return `@${w.identity.author}`;
  return w.authorName ?? '作者不明';
}

/** アプリで開く URL。`acct:handle@host/name` → `https://host/@handle/name` */
export function worldShareUrl(w: WorldListItem): string {
  const m = /^acct:([^@/]+)@([^/]+)\/(.+)$/.exec(w.identity?.worldId ?? '');
  if (m) return `https://${m[2]}/@${encodeURIComponent(m[1])}/${encodeURIComponent(m[3])}`;
  if (w.sharePath) return `https://${worldHost(w)}${w.sharePath}`;
  return `https://${worldHost(w)}/`;
}

export function isVerified(w: WorldListItem): boolean {
  return w.identity?.status === 'verified';
}

export type WorldArt = 'cinema' | 'danmaku' | 'wasm' | 'draw' | 'room';

/** サムネイルが無いときの絵柄を、入っている mod から決める */
export function worldArt(w: WorldListItem): WorldArt {
  const ids = new Set(w.mods.map((m) => m.id));
  if (ids.has('video-player')) return 'cinema';
  if (ids.has('danmaku')) return 'danmaku';
  if (ids.has('wasm-demo')) return 'wasm';
  if (ids.has('pen')) return 'draw';
  return 'room';
}

/** トップに出す分。新しいものを先に、日付の無い同梱ワールドはそのあと */
export function pickFeatured(worlds: WorldListItem[], n = 6): WorldListItem[] {
  const time = (w: WorldListItem) => Date.parse(w.updatedAt ?? w.createdAt ?? '') || 0;
  return [...worlds].sort((a, b) => time(b) - time(a)).slice(0, n);
}
