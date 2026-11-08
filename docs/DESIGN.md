# hub.ubichill.com 設計

ubichill の「ホーム＋ドキュメント」サイト。アプリ本体（ubichill.com）とは別リポジトリ・別デプロイ。
参考は [Misskey Hub](https://misskey-hub.net/ja/)。

デザインは `mockups/` で 10 案を比べ、案 A（Hub Classic）に案 J（Federation）のネットワーク表現を足した **案 K**（`mockups/k-own-your-world.html`）で進めることにした（2026-11-08）。
この文書は決めたことの記録。日々の使い方は [README](../README.md)。

---

## 1. 伝えること

いちばんの魅力は **「ワールドも mod も、自分で作って、自分で持てる」**。それを支えるのが **分散**。

1. **自分で持てる** — ワールドも mod も URL。置き場所は Ubichill・GitHub Pages・自分のサーバー・静的ホストのどこでもいい。作者署名（ed25519）があるので、置き場所が変わっても本物とわかる。秘密鍵はサーバーに預けない。
2. **ブラウザで作れる** — エディタで置くだけ。裏はおなじ YAML。
3. **コードで書ける** — ワールドは YAML、mod は TypeScript。ふつうのコードなので AI に頼める。
4. **中央を持たない** — 人（ホームサーバー）・部屋（部屋のサーバー）・作品（作者の URL）がそれぞれ別の場所にあり、つながっている。

文章は見出し＋一言まで。カーソルが動く演出は入れない（ヒーローは後で動画にする）。装飾の文字（SCROLL など）も入れない。

事実は本体に合わせる（CLI は `ubichill dev / build / install / verify / login / publish / ci create`、SDK は `Ubi.state.define` + `Ubi.state.sync`、公開は Web・CLI・CI）。本体に無いもの（`llms.txt` など hub 側の提案）は「予定」と書く。

## 2. 誰に何を

| 誰に | 何を |
|---|---|
| はじめての人 | 何ができるか分かって、ワンクリックでアプリに入れる |
| 使っている人 | はじめかた・公開範囲・招待・用語 |
| ワールドを作る人（エディタ派） | エディタの使い方、公開のしかた |
| コードで作る人・AI を使う人 | YAML / TypeScript の書き方、`llms.txt`、フォーマットのリファレンス |
| mod 開発者 | SDK（npm `ubichill`）・CLI（`@ubichill/cli`）・権限・API |
| サーバー管理者 | Helm、連合のしくみ、トラブルシューティング |

「ソフトウェアの公式サイト」であって特定サーバーの LP ではない（連合前提）。ただし今は ubichill.com が主な入口なので、CTA の 1 番目は「アプリを開く」。

## 3. ページ構成（実装済み）

```
/                          トップ（src/pages/index.astro）
/docs/                     ドキュメントの入口
/docs/getting-started/     はじめかた                      hub が執筆
/docs/concepts/            しくみと用語                    hub が執筆
/docs/create/editor/       エディタでワールドを作る        hub が執筆
/docs/create/world-as-code/  World as Code                 本体 docs/worlds/WORLD_AS_CODE.md を同期
/docs/create/world-format/   ワールド定義フォーマット      本体 docs/worlds/FORMAT.md
/docs/create/with-ai/      AI と一緒に作る                 hub が執筆
/docs/mods/                はじめての mod                  hub が執筆
/docs/mods/sdk/ cli/ api/ package/ runtime/ capabilities/  本体を同期
/docs/publish/             署名して公開する                hub が執筆
/docs/servers/federation/  連合のしくみ                    hub が執筆
/docs/servers/access/      公開範囲・フレンド・招待        hub が執筆
/docs/servers/self-hosting/ troubleshooting/               本体を同期
/docs/internals/architecture/ protocols/ service-token/ contributing/   本体を同期
/docs/releases/cli/ sdk/   CHANGELOG                        本体を同期
/llms.txt  /llms-full.txt  AI 向け（ドキュメントから自動生成）
```

トップの流れ: ヒーロー → 柱 4 枚 → つくる（エディタ / コード＋AI）→ 持つ（署名済みワールドの例）→ mod（コード・CLI・権限）→ 分散（人・部屋・作品、サーバーの図と一覧、Helm）→ ほかの人のワールド → はじめる → オープンソース。

将来: `/worlds/`（ワールドを探す）、`/servers/`（連合サーバー一覧）、`/blog/`、英語版（Starlight の `locales.en`）。ドキュメントを `/docs/` 配下にしたのは、これらと衝突させないため。

## 4. 技術

| 項目 | 採用 | メモ |
|---|---|---|
| フレームワーク | Astro 7（静的出力） | JS は 3D ロゴ・テーマ切替・メニュー・Mermaid だけ |
| スタイル | PandaCSS 2（PostCSS 経由） | トークンは `src/design/tokens.ts`。**Panda 2 は `presets` を明示しないと条件もブレークポイントも入らない** |
| ドキュメント | Starlight 0.42 | サイドバー・検索（Pagefind）・明暗・多言語が揃う。色とフォントは `src/styles/starlight.css` で Panda の変数を `--sl-*` に流す |
| ダークモード | `<html data-theme>` | Starlight と同じ属性・同じ `localStorage['starlight-theme']`。Panda の `_dark` を `[data-theme="dark"] &` にしてある |
| フォント | fontsource（自前配信） | Nunito Variable / M PLUS Rounded 1c / JetBrains Mono Variable |
| 画像 | `astro:assets` | ヒーロー・エディタの画像は WebP に最適化 |
| 図 | Mermaid（ブラウザ側） | 同期スクリプトが ```mermaid を `<pre class="mermaid">` に変え、`MarkdownContent.astro` が描く |
| Lint | Biome 2 | `.astro` では未使用変数の警告を切っている（テンプレートでの使用を追えないため） |
| 型 | `tsc --noEmit` | `astro check` は TypeScript 7 で動かない |

### ディレクトリ

```
src/
  design/tokens.ts         トークン（tokens / semanticTokens / textStyles / keyframes）
  styles/panda.css         @layer 宣言（PostCSS がここに生成 CSS を入れる）
  styles/global.css        トップ用リセット（@layer base に入れて utilities より弱く）
  styles/starlight.css     Starlight への橋渡し（--sl-* ← --colors-*）
  components/              Header / Footer / Button / Icon / Logo3D / ThemeToggle / Section
  components/landing/      トップの各セクション
  components/starlight/    Starlight の上書き（SocialIcons にアプリへのボタン、MarkdownContent に Mermaid）
  layouts/Base.astro       トップのレイアウト（描画前にテーマを決めるスクリプト入り）
  pages/index.astro        トップ
  pages/llms*.txt.ts       AI 向けテキスト
  data/site.ts             URL・ナビ・例示データ
  content/docs/docs/       ドキュメント本文（Starlight）
  content/synced.json      同期したページの元ファイル一覧と本体のコミット
scripts/sync-docs.mjs      本体からの取り込み（MANIFEST を編集して追加）
public/logo/               3D ロゴ用のレイヤー画像
```

## 5. デザイントークン

3 層。コンポーネントからは **役割の名前（semanticTokens）と textStyles だけ** を使う。

| 層 | 例 | 役割 |
|---|---|---|
| tokens | `navy.900` `cream.100` `periwinkle.300` `fonts.heading` `radii.lg` | 生の値。直接使わない |
| semanticTokens | `bg` `bg.surface` `bg.hero` `bg.inverse` `fg` `fg.muted` `accent` `accent.fg` `highlight` `link` `border` `tint.sky` `status.ok` | 役割。`{ base, _dark }` で明暗 |
| textStyles | `display` `h2` `h3` `lead` `small` `eyebrow` `mono` | 文字組み |

ロゴの 3 色（sky `#bde1fb` / periwinkle `#9ab2f8` / lavender `#ceb0fa`）は白地でのコントラスト比が 1.4〜2.1 しかないので、**明るいテーマでは文字やボタンに使わず、面と装飾に回す**。暗いテーマではアクセント（ボタン・リンク）に periwinkle を使う（7〜10:1 取れる）。

将来 ubichill 本体と共有するときは `tokens.ts` を `@ubichill/panda-preset` として切り出す。本体の今のトークン（`primary`, `background` などフラットな名前）はそのときに寄せる。

## 6. 3D ロゴ

いまは CSS 3D（ロゴを色ごとの 3 枚に分け、薄い板を重ねて押し出し、ポインタで傾ける。`Logo3D.astro`）。依存ゼロで軽い。
本物の光沢を出すなら **ロゴの SVG** を起こして Blender で押し出し → glTF → Three.js（`client:visible`）に差し替える。`Logo3D.astro` の中身だけ替えれば済む構造にしてある。`prefers-reduced-motion` では動きを止める。

## 7. 本体ドキュメントとの同期

- `scripts/sync-docs.mjs` の `MANIFEST` に「本体のパス → hub のパス・説明・並び順」を書く。
- 先頭の H1 をタイトルに、相対リンクは同期済みページなら hub のパスへ、そうでなければ GitHub の URL へ。冒頭に「本体から同期」の注記。
- `pnpm sync-docs --check` で差分検知。`.github/workflows/sync-docs.yml` が毎週 PR を作る。
- 本体側で直すべきページに hub 側で手を入れると、次の同期で消える。編集リンク（各ページ右上）は本体の GitHub を指している。

## 8. 残っていること

1. ヒーロー用の動画（ワールドの様子・無音ループ・2MB 以内が目安）。`src/data/site.ts` の `heroVideo` に入れる
2. ロゴの SVG 化（3D を Three.js にするなら）
3. デプロイ先（静的出力なので GitHub Pages / Cloudflare Pages / 自前 k3s の nginx いずれも可）と `site` の確定
4. `/worlds/` `/servers/` の一覧ページ（本体の連合 API や `mods/index.json` から生成）
5. 英語版
6. ワールドの JSON Schema 配布（本体の Zod スキーマから生成して `/schemas/` に置く）
