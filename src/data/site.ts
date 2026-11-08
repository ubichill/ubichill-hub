/**
 * サイト全体で使うリンク・文言。
 * トップページの文章はコンポーネント側にあるが、URL と繰り返し使うものはここに集める。
 * ワールドの一覧は `worlds.ts`（ビルド時に API から取る）。
 */
export const site = {
  name: 'Ubichill',
  tagline: 'ゆるく集まる、じぶんの部屋。描いたり、観たり、いっしょに過ごす、中央のない 2D メタバース。',
  app: 'https://ubichill.com/',
  repo: 'https://github.com/ubichill/ubichill',
  hubRepo: 'https://github.com/ubichill/ubichill-hub',
  npm: {
    sdk: 'https://www.npmjs.com/package/ubichill',
    cli: 'https://www.npmjs.com/package/@ubichill/cli',
  },
  /** ヒーローの動画。用意できたら `/hero/world.webm` のように public 配下のパスを入れる */
  heroVideo: null as string | null,
} as const;

export const nav = [
  { label: 'ドキュメント', href: '/docs/' },
  { label: 'つくる', href: '/docs/create/editor/' },
  { label: 'mod', href: '/docs/mods/' },
  { label: 'サーバー', href: '/docs/servers/federation/' },
] as const;

/** お知らせピル（トップのヒーロー） */
export const announcement = {
  label: 'federation v1',
  text: 'サーバー間の連合に対応',
  href: '/docs/servers/federation/',
} as const;

/**
 * 連合しているサーバー。いまは公式だけ。
 * 連合先を一覧する API ができたら、ここをビルド時の取得に置き換える。
 */
export const servers = [{ host: 'ubichill.com', name: 'Ubichill', note: '公式サーバー', official: true }] as const;

export type Server = (typeof servers)[number];
