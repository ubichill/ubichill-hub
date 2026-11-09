/**
 * フェディバース（Misskey・Mastodon など）から見える ubichill のアカウントの例。
 *
 * ビルド時に WebFinger → actor（ActivityPub の Person）を 1 回取りに行き、名前・アイコン・自己紹介を使う。
 * 届かなければ下の値で代用する。ワールドは公開一覧のうち、この人が作ったもの。
 */
import { API_ORIGIN, getWorlds, type WorldListItem } from './worlds';

export const FEDI_HANDLE = 'youkan@ubichill.com';

export interface FediProfile {
  handle: string;
  name: string;
  summary: string;
  icon: string | null;
  url: string;
  worlds: WorldListItem[];
}

const FALLBACK = { name: 'devようかん', summary: 'vrchat!!', icon: null, url: 'https://ubichill.com/@youkan' };

let cache: Promise<FediProfile> | undefined;

export function getFediProfile(): Promise<FediProfile> {
  cache ??= load();
  return cache;
}

async function getJson(url: string, accept: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    headers: { accept, 'user-agent': 'ubichill-hub build (+https://hub.ubichill.com/)' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function loadActor(): Promise<Omit<FediProfile, 'handle' | 'worlds'>> {
  try {
    const wf = await getJson(
      `${API_ORIGIN}/.well-known/webfinger?resource=acct:${FEDI_HANDLE}`,
      'application/jrd+json',
    );
    const self = (wf.links as { rel: string; href?: string }[]).find((l) => l.rel === 'self')?.href;
    if (!self) throw new Error('self link が無い');
    const actor = await getJson(self, 'application/activity+json');
    return {
      name: String(actor.name ?? FALLBACK.name),
      // 自己紹介は段落と改行だけの HTML。タグを落として文字だけにする
      summary: String(actor.summary ?? '')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .trim(),
      icon: (actor.icon as { url?: string } | undefined)?.url ?? null,
      url: String(actor.url ?? FALLBACK.url),
    };
  } catch (e) {
    console.warn(`[fediverse] ${FEDI_HANDLE} を取れなかったので保存してある値を使う: ${(e as Error).message}`);
    return FALLBACK;
  }
}

async function load(): Promise<FediProfile> {
  const [actor, { worlds }] = await Promise.all([loadActor(), getWorlds()]);
  return { handle: FEDI_HANDLE, ...actor, worlds: worlds.filter((w) => w.identity?.author === FEDI_HANDLE) };
}
