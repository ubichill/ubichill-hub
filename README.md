# ubichill-hub

[hub.ubichill.com](https://hub.ubichill.com/) — Ubichill のホーム・ドキュメント。
アプリ本体は [ubichill/ubichill](https://github.com/ubichill/ubichill)。

- トップページ: `src/pages/index.astro`（Astro + PandaCSS）
- ドキュメント: `src/content/docs/docs/`（Starlight）。`/docs/` 配下に出る
- 設計の経緯: `docs/DESIGN.md`、デザイン案の HTML: `mockups/`

## 動かす

```bash
mise install       # Node 22 / pnpm 10
pnpm install       # prepare で panda codegen も走る
pnpm dev           # http://localhost:4321/
pnpm build         # dist/ に静的出力
pnpm preview
```

ビルド中に `https://ubichill.com/api/v1/worlds` を 1 回取りに行く（トップの「ほかの人のワールド」と、サーバーのワールド数）。
届かないときは `src/data/worlds.fallback.json` を使うので、オフラインでもビルドは通る。
取得先を変えるには `UBICHILL_API=https://pr-123.ubichill.com pnpm build`。

## デプロイ（Cloudflare Pages）

Cloudflare Pages に Git 連携で置く。ダッシュボードの設定はこれだけ。

| 項目 | 値 |
|---|---|
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node のバージョン | `.node-version`（22.23.4）を読む。pnpm は `package.json` の `packageManager` から |
| カスタムドメイン | `hub.ubichill.com` |

`public/_headers` がそのまま `dist/_headers` に出て、キャッシュとセキュリティのヘッダーになる。

ワールド一覧を新しくするには、Pages の **Deploy Hook** を作って URL をリポジトリの Secrets `CF_PAGES_DEPLOY_HOOK` に入れる。
`.github/workflows/rebuild.yml` が毎日 03:00 JST に叩いてビルドし直す（Secret が無ければ何もしない）。

手元から出すなら `pnpm build && npx wrangler pages deploy dist --project-name ubichill-hub`。

## ドキュメントの直し方

ページは 2 種類ある。ページ冒頭に「ubichill 本体から同期」とあるかどうかで見分ける。

| 種類 | 置き場所 | 直す場所 |
|---|---|---|
| hub が書いたページ（はじめかた・エディタ・公開・連合…） | `src/content/docs/docs/**` | このリポジトリで直接編集 |
| 本体から同期したページ（API・フォーマット・CLI・権限・アーキテクチャ・CHANGELOG） | 同上。`src/content/synced.json` に一覧 | **本体リポジトリで直し**、`pnpm sync-docs` で取り込む |

```bash
pnpm sync-docs           # ../ubichill（または $UBICHILL_DIR、無ければ GitHub から clone）から取り込む
pnpm sync-docs --check   # 取り込み結果が今のファイルと同じか確かめる
```

取り込むファイルの一覧は `scripts/sync-docs.mjs` の `MANIFEST`。1 行足せば新しいページになる。
GitHub Actions（`.github/workflows/sync-docs.yml`）が毎週、差分があれば PR を作る。

Starlight の書き方: フロントマターに `title` と `description`、本文は H2 から。`:::note` / `:::tip` / `:::caution` が使える。
サイドバーの並びは `astro.config.mjs` の `sidebar`（ディレクトリごとに自動生成。順番は `sidebar.order`）。

## トップページの素材

| ファイル | 何か | 作り方 |
|---|---|---|
| `src/assets/world-together.png` | 夜の部屋に 4 人が集まってペンで描いている実画面 | 本体を「インスタンスだけ」モードで動かし、Playwright で 4 人分入って描き、`rin` の視点を 16:9 に切り抜いた（`docs/DESIGN.md` の手順） |
| `src/assets/editor-canvas.png` | ワールドエディタの画面 | `src/assets/app-editor.png`（本体 `docs/image.png` と同じ）を 16:9 に切り抜き |
| `public/favicon.png` `apple-touch-icon.png` | 暗い地のアイコン | `node scripts/make-icons.mjs`（`src/assets/logo.png` から生成。本体の白地アイコンと見分けるため暗い） |
| `public/logo/*.png` | 3D ロゴの層 | ロゴを色ごとに分けたもの |

ヒーローの画面を動画にするときは `src/data/site.ts` の `heroVideo` に public 配下のパスを入れる。`<video>` に切り替わる。

## デザイントークン

`src/design/tokens.ts` が唯一の置き場所。PandaCSS の tokens（生の値）→ semanticTokens（役割、明暗はここ）→ textStyles。
コンポーネントからは `bg: 'bg.surface'`、`color: 'fg.muted'`、`textStyle: 'h2'` のように**役割の名前だけ**を使う。
ドキュメント（Starlight）の見た目はテーマ [starlight-theme-rapide](https://github.com/HiDeoo/starlight-theme-rapide) に任せている。
`src/styles/starlight.css` で合わせているのはフォントと色相（`--sl-hue-base` / `--sl-hue-accent`）だけ。色を細かく直したくなったら、まずテーマの設定で済まないかを見る。

雰囲気の決めごと（夕暮れの部屋）は `docs/DESIGN.md` の「5. デザイントークン」。

ダークモードは `<html data-theme="dark">`。Starlight と同じ `localStorage['starlight-theme']` を使うので、トップとドキュメントで設定が共有される。

### PandaCSS を書くときの注意（Panda 2 系）

- `panda.config.ts` の `presets` は消さない。無いと条件（`_hover` `_dark`）もブレークポイント（`md:` `mdDown:`）も入らず、静かに崩れる。
- 同じプロパティを 2 つの `css()` で指定して `class:list` で合成すると、どちらが勝つかは生成順で決まる（`Logo3D` に `position: absolute` を渡しても効かなかった）。外側に 1 枚 `<div>` を置いて、そこに位置を指定する。
- `styled-system/` は生成物（gitignore 済み）。トークンを変えたら `pnpm panda codegen`（`pnpm install` 時にも走る）。

## 確認

```bash
pnpm lint      # Biome（整形 + lint）。直すのは pnpm lint:fix
pnpm check     # tsc
pnpm build
```

## まだ無いもの

- ヒーローの動画（`src/data/site.ts` の `heroVideo`）
- ロゴの SVG（3D ロゴを Three.js にするなら必要。いまは PNG を層にした CSS 3D）
- 連合サーバーの一覧（いまは `src/data/site.ts` の `servers` に ubichill.com だけ）
- 英語版（Starlight の `locales` に `en` を足し、`src/content/docs/en/` を作る）
