/**
 * サイト全体で使うリンク・文言・例示データ。
 * トップページの文章はコンポーネント側にあるが、URL と繰り返し使う例はここに集める。
 */
export const site = {
  name: 'Ubichill',
  tagline: 'ワールドも mod も、自分で作って、自分で持てる。中央のない 2D メタバース。',
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

/** 連合の図とサーバー一覧に出す例。実在のサーバーではない */
export const exampleServers = [
  { host: 'ubichill.com', note: '公式', users: 128, icon: 'globe', x: 14, y: 30 },
  { host: 'yokan.example', note: '個人', users: 3, icon: 'home', x: 40, y: 20 },
  { host: 'school.ac.jp', note: 'ゼミ', users: 12, icon: 'book', x: 26, y: 72 },
  { host: 'mio.dev', note: 'mod 作者', users: 5, icon: 'puzzle', x: 56, y: 62 },
  { host: 'cafe.example', note: 'カフェ', users: 8, icon: 'tv', x: 76, y: 26 },
  { host: 'your.server', note: 'あなたのサーバー', users: 1, icon: 'server', x: 86, y: 70, you: true },
] as const;

export const exampleLinks = [
  [0, 1],
  [0, 2],
  [1, 4],
  [2, 3],
  [3, 5],
  [4, 5],
  [1, 3],
  [0, 3],
  [4, 3],
] as const;

/** 「ほかの人のワールドへ」の例。実在のワールドではない */
export const exampleWorlds = [
  { title: '週末の映画鑑賞会', author: '@haku@ubichill.com', host: 'ubichill.com', art: 'cinema' },
  { title: 'チルな作業部屋', author: '@yokan@yokan.example', host: 'yokan.github.io', art: 'notes' },
  { title: 'みんなのアトリエ', author: '@mio@mio.dev', host: 'mio.dev', art: 'draw' },
  { title: 'ゼミの輪読会', author: '@lab@school.ac.jp', host: 'school.ac.jp', art: 'event' },
  { title: '弾幕ライブ', author: '@rin@ubichill.com', host: 'ubichill.com', art: 'danmaku' },
  { title: 'WASM のおもちゃ箱', author: '@taro@taro.dev', host: 'taro.dev', art: 'wasm' },
] as const;

export type ExampleWorld = (typeof exampleWorlds)[number];
export type ExampleServer = (typeof exampleServers)[number];
