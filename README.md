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

## デザイントークン

`src/design/tokens.ts` が唯一の置き場所。PandaCSS の tokens（生の値）→ semanticTokens（役割、明暗はここ）→ textStyles。
コンポーネントからは `bg: 'bg.surface'`、`color: 'fg.muted'`、`textStyle: 'h2'` のように**役割の名前だけ**を使う。
Starlight 側は `src/styles/starlight.css` で `--sl-*` に Panda の変数（`--colors-*`）を流しているので、トークンを変えれば両方に効く。

ダークモードは `<html data-theme="dark">`。Starlight と同じ `localStorage['starlight-theme']` を使うので、トップとドキュメントで設定が共有される。

### PandaCSS を書くときの注意（Panda 2 系）

- `'& .child': { bg: 'bg.subtle' }` のような**入れ子セレクタの中では、ショートハンドとトークン名が解決されない**（そのまま CSS に出る）。
  入れ子にせず、子要素に `css()` のクラスを直接付ける。どうしても入れ子にするときは `background: '{colors.bg.subtle}'` のように**完全なプロパティ名と `{token}` 参照**で書く。
- `smDown` / `mdDown` のような「以下」のブレークポイントは無い。**モバイルを基本にして `md: {}` / `lg: {}` で上書き**する。
- `styled-system/` は生成物（gitignore 済み）。トークンを変えたら `pnpm panda codegen`（`pnpm install` 時にも走る）。

## 確認

```bash
pnpm lint      # Biome（整形 + lint）
pnpm check     # tsc
pnpm build
```

## まだ無いもの

- ヒーローの動画（`src/data/site.ts` の `heroVideo` に public 配下のパスを入れると `<video>` に切り替わる）
- ロゴの SVG（3D ロゴを Three.js にするなら必要。いまは PNG を層にした CSS 3D）
- 英語版（Starlight の `locales` に `en` を足し、`src/content/docs/en/` を作る）
- デプロイ先（`dist/` は静的なので GitHub Pages / Cloudflare Pages / 自前の nginx どれでも）
