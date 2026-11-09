# hub.ubichill.com 設計

ubichill の「ホーム＋ドキュメント」サイト。アプリ本体（ubichill.com）とは別リポジトリ・別デプロイ（Cloudflare Pages）。
参考は [Misskey Hub](https://misskey-hub.net/ja/) だが、見た目は寄せない（下の「雰囲気」）。

デザインは `mockups/` で 10 案を比べ、案 A（Hub Classic）に案 J（Federation）のネットワーク表現を足した **案 K**（`mockups/k-own-your-world.html`）で進めることにした（2026-11-08）。
その後「Misskey に似すぎている。chill らしく、くつろぎを感じる見た目に」との指摘で、構成はそのまま、雰囲気を **夕暮れの部屋** に変えた（同日）。
この文書は決めたことの記録。日々の使い方は [README](../README.md)。

---

## 1. 伝えること

いちばんの魅力は **「ワールドも mod も、自分で作って、自分で持てる」**。それを支えるのが **分散**。
そして ubichill の体験は **「ゆるく集まって、描いたり観たり、いっしょに過ごす」**。見出しはこれを先に言う。

1. **自分で持てる** — ワールドも mod も URL。置き場所は Ubichill・GitHub Pages・自分のサーバー・静的ホストのどこでもいい。作者署名（ed25519）があるので、置き場所が変わっても本物とわかる。秘密鍵はサーバーに預けない。
2. **ブラウザで作れる** — エディタで置くだけ。裏はおなじ YAML。
3. **コードで書ける** — ワールドは YAML、mod は TypeScript。ふつうのコードなので AI に頼める。
4. **中央を持たない** — 人（ホームサーバー）・部屋（部屋のサーバー）・作品（作者の URL）がそれぞれ別の場所にあり、つながっている。

文章は見出し＋一言まで。カーソルが動く演出は入れない（ヒーローは後で動画にする）。装飾の文字（SCROLL など）も入れない。

事実は本体に合わせる（CLI は `ubichill dev / build / install / verify / login / publish / ci create`、SDK は `Ubi.state.define` + `Ubi.state.sync`、公開は Web・CLI・CI）。本体に無いもの（`llms.txt` など hub 側の提案）は「予定」と書く。
例示に使うホスト名は、実在するもの（ubichill.com）か、明らかに例とわかるもの（`yokan.example`、`your.server`）だけ。架空のサーバー一覧・架空のワールド一覧は出さない。

## 2. 雰囲気（chill）

「夕暮れの部屋で、みんなでだらっと過ごす」。Misskey Hub との違いはここで作る。

| 要素 | 決めたこと |
|---|---|
| 面の色 | cream の紙（`bg`）に、空の色の薄いグラデーション（`gradients.dusk`: sky → periwinkle → lavender → peach）。暗いテーマは本体のワールド背景（`#141d33`）と同じ夜の部屋に、ランプの光（`gradients.lamp`）と星 |
| 画面の見せ方 | 実画面は必ず **暗い窓**（`Window.astro`）に入れる。本体アプリの cream の UI と混ざらないようにするため。favicon も同じ理由で暗い地 |
| 形 | 角丸は大きく（`radii.lg` 28px、`xl` 44px）。直線の区切りは使わない。色のついた丸い飾り（もち形の面など）は置かない |
| 影 | 輪郭を出さず、ぼんやり落とす（`shadows.card` `float`）。ガラス風の枠線は使わない |
| 文字 | 見出しは M PLUS Rounded 1c の 800。見出しの上の小さな札（eyebrow。「持つ」「分散」など）は置かない。見出しだけで足りる |
| 動き | ゆっくり（空の色が 26 秒で流れる `drift`、星の `breathe`、窓の `float`）。`prefers-reduced-motion` では止まる。速い動き・カーソル演出は入れない |
| 質感 | 面に紙のざらつき（`--noise`、SVG の feTurbulence）を 5〜9% で重ねる |
| 画像 | 実画面を使う。ヒーローと「自分で持てる」は、本体を手元で動かして 4 人で入り、ペンで描いた夜の部屋（`src/assets/world-together.png`） |

## 3. 誰に何を

| 誰に | 何を |
|---|---|
| はじめての人 | 何ができるか分かって、ワンクリックでアプリに入れる |
| 使っている人 | はじめかた・公開範囲・招待・用語 |
| ワールドを作る人（エディタ派） | エディタの使い方、公開のしかた |
| コードで作る人・AI を使う人 | YAML / TypeScript の書き方、`llms.txt`、フォーマットのリファレンス |
| mod 開発者 | SDK（npm `ubichill`）・CLI（`@ubichill/cli`）・権限・API |
| サーバー管理者 | Helm、連合のしくみ、トラブルシューティング |

「ソフトウェアの公式サイト」であって特定サーバーの LP ではない（連合前提）。ただし今は ubichill.com が唯一のサーバーなので、CTA の 1 番目は「アプリを開く」で、サーバー一覧も ubichill.com だけ。

## 4. ページ構成（実装済み）

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

トップの流れ: ヒーロー（見出し・一言・お知らせ・ボタン・実画面の窓・3D ロゴ）→ 特徴 4 枚（それぞれ暗い窓に実画面か図）→ 持つ（署名済みワールドの例）→ mod（夜の帯。コード・CLI・権限）→ 分散（人・部屋・作品、夜空のサーバーの図、ubichill.com と Helm、Misskey・Mastodon からのフォロー）→ ほかの人のワールド（API から）→ はじめる → オープンソース。

「つくる」のセクションは、特徴 4 枚にエディタとコードの実画面を入れたので重複になり、外した（2026-11-08）。

将来: `/worlds/`（ワールドを探す）、`/servers/`（連合サーバー一覧）、`/blog/`、英語版（Starlight の `locales.en`）。ドキュメントを `/docs/` 配下にしたのは、これらと衝突させないため。

## 5. 本体のデータ

| データ | 取り方 | 置き場所 |
|---|---|---|
| 公開ワールド一覧 | ビルド時に `GET {UBICHILL_API}/api/v1/worlds`（認証不要）。届かなければ `worlds.fallback.json` | `src/data/worlds.ts` |
| サーバー一覧 | まだ API が無いので `servers` に ubichill.com だけ。ワールド数は上の件数 | `src/data/site.ts` |
| フェディバースの例（`@youkan@ubichill.com`） | ビルド時に WebFinger → actor（Person）で名前・アイコン・自己紹介。ワールドは上の一覧から作者で絞る。届かなければ保存してある値 | `src/data/fediverse.ts` |

ブラウザから直接 fetch しないのは、本番の CORS が `https://ubichill.com` しか許可していないため（Helm の `CORS_ORIGIN`。これは Better Auth の `trustedOrigins` にも使われるので、hub を足すのは慎重に）。
その代わり Cloudflare Pages の Deploy Hook を毎日叩いてビルドし直す（`.github/workflows/rebuild.yml`）。

本体の API で分かっていること（2026-11-08 時点、`packages/backend`）:
- 一覧は署名検証済みのワールドだけ。人気順・新着順・ページングは無い。`createdAt` / `updatedAt` は DB にあるワールドだけ付く
- `thumbnail` は作者が YAML に書いた絶対 URL で、生成はされない。公式ワールドには無いので、hub 側で mod から絵柄を決めて描いている（`worldArt`）
- 開く URL は `identity.worldId`（`acct:handle@host/name`）から `https://host/@handle/name`
- NodeInfo（`/nodeinfo/2.1`）は出ているが、`usage.users` は空
- 2026-11-09（#318）から Mastodon・Misskey からフォローできる。作ったワールドを固定ノート（`featured`）に出すのは `feat/fediverse-featured` ブランチ（2026-11-10 時点で main には未マージ）。フェディバースへの投稿は予定
- 本体側で変えたくなったら: 公開 GET に `Access-Control-Allow-Origin: *` を付ける（`routes/authors.ts` と同じ形）、NodeInfo に `usage.users` を入れる

## 6. 技術

| 項目 | 採用 | メモ |
|---|---|---|
| フレームワーク | Astro 7（静的出力） | JS は 3D ロゴ・テーマ切替・メニュー・Mermaid だけ |
| スタイル | PandaCSS 2（PostCSS 経由） | トークンは `src/design/tokens.ts`。**Panda 2 は `presets` を明示しないと条件もブレークポイントも入らない** |
| ドキュメント | Starlight 0.42 ＋ starlight-theme-rapide ＋ starlight-image-zoom | サイドバー・検索（Pagefind）・明暗・多言語が揃う。見た目はテーマに任せ、`src/styles/starlight.css` ではフォントと色相だけ合わせる |
| ダークモード | `<html data-theme>` | Starlight と同じ属性・同じ `localStorage['starlight-theme']`。Panda の `_dark` を `[data-theme="dark"] &` にしてある |
| フォント | fontsource（自前配信） | Nunito Variable / M PLUS Rounded 1c / JetBrains Mono Variable |
| 画像 | `astro:assets` | 実画面の PNG は WebP に最適化。ワールドのサムネイル（外部 URL）は素の `<img loading="lazy">` |
| 図 | Mermaid（ブラウザ側） | 同期スクリプトが ```mermaid を `<pre class="mermaid">` に変え、`MarkdownContent.astro` が描く |
| デプロイ | Cloudflare Pages | `pnpm build` → `dist/`。`public/_headers`、`.node-version`。Deploy Hook で毎日再ビルド |
| Lint | Biome 2 | `.astro` では未使用変数の警告を切っている（テンプレートでの使用を追えないため） |
| 型 | `tsc --noEmit` | `astro check` は TypeScript 7 で動かない |

### ディレクトリ

```
src/
  design/tokens.ts         トークン（tokens / semanticTokens / textStyles / keyframes）
  styles/panda.css         @layer 宣言（PostCSS がここに生成 CSS を入れる）
  styles/global.css        トップ用リセットと --noise（@layer base に入れて utilities より弱く）
  styles/starlight.css     Starlight のフォントと色相（見た目は rapide テーマ）
  components/              Header / Footer / Button / Icon / Logo3D / ThemeToggle / Section / Window
  components/landing/      トップの各セクション
  components/starlight/    Starlight の上書き（SocialIcons にアプリへのボタン、MarkdownContent に Mermaid）
  layouts/Base.astro       トップのレイアウト（描画前にテーマを決めるスクリプト入り）
  pages/index.astro        トップ
  pages/llms*.txt.ts       AI 向けテキスト
  data/site.ts             URL・ナビ・サーバー一覧
  data/worlds.ts           ワールド一覧（ビルド時に API から）と worlds.fallback.json
  assets/                  実画面（world-together / editor-canvas）、ロゴ
  content/docs/docs/       ドキュメント本文（Starlight）
  content/synced.json      同期したページの元ファイル一覧と本体のコミット
scripts/sync-docs.mjs      本体からの取り込み（MANIFEST を編集して追加）
scripts/make-icons.mjs     favicon / apple-touch-icon の生成
public/logo/               3D ロゴ用のレイヤー画像
public/_headers            Cloudflare Pages のヘッダー
```

## 7. デザイントークン

3 層。コンポーネントからは **役割の名前（semanticTokens）と textStyles だけ** を使う。

| 層 | 例 | 役割 |
|---|---|---|
| tokens | `navy.925`（ワールド背景）`cream.100` `periwinkle.300` `peach.300` `fonts.heading` `radii.lg` | 生の値。直接使わない |
| semanticTokens | `bg` `bg.surface` `bg.inverse`（夜の部屋）`bg.frame`（窓の枠）`fg` `fg.muted` `accent` `accent.fg` `warm` `link` `border` `tint.*` `status.*` `gradients.dusk` `gradients.lamp` | 役割。`{ base, _dark }` で明暗 |
| textStyles | `display` `h2` `h3` `lead` `small` `eyebrow`（フッターの列見出し） `mono` | 文字組み |

ロゴの 3 色（sky `#bde1fb` / periwinkle `#9ab2f8` / lavender `#ceb0fa`）は白地でのコントラスト比が 1.4〜2.1 しかないので、**明るいテーマでは文字やボタンに使わず、面と装飾に回す**。暗いテーマではアクセント（ボタン・リンク）に periwinkle を使う（7〜10:1 取れる）。暖色の peach も同じく面と光だけ。

将来 ubichill 本体と共有するときは `tokens.ts` を `@ubichill/panda-preset` として切り出す。本体の今のトークン（`primary`, `background` などフラットな名前）はそのときに寄せる。

## 8. 3D ロゴ

いまは CSS 3D（ロゴを色ごとの 3 枚に分け、薄い板を重ねて押し出し、ポインタで傾ける。`Logo3D.astro`）。依存ゼロで軽い。
本物の光沢を出すなら **ロゴの SVG** を起こして Blender で押し出し → glTF → Three.js（`client:visible`）に差し替える。`Logo3D.astro` の中身だけ替えれば済む構造にしてある。`prefers-reduced-motion` では動きを止める。
置き場所は親の `<div>` で決める（`Logo3D` 自身に `position` を渡しても、生成 CSS の順番で負けることがある）。

## 9. 実画面の撮り方

ヒーローの `world-together.png` は本体の「インスタンスだけ」モードで撮った（SNS と DB は使わない）。

```sh
# ubichill リポジトリで
node packages/cli/src/index.ts world build <夜の部屋の yaml> --out=/tmp/chill.json   # lock は worlds/default.lock.json を流用
go -C services/instance run ./cmd/instance --guests --world=/tmp/chill.json --origins=http://localhost:3000
(cd packages/frontend && ./node_modules/.bin/vite --port 3000)
# Playwright で http://localhost:3000/world.html?name=<名前> に 4 人で入り、トレイのペンをクリックして持ち、
# mouse.down/move/up で描く。1 人の視点を 16:9 に切り抜く
```

夜の部屋は `worlds/default.yaml` の `backgroundColor` を `#141d33` に、ペンの色をロゴ 3 色＋peach にしたもの。
ペンの grip は `share: 'persistent'` なので、同じ名前で入り直すと前のペンを持ったままになり線が二重になる。撮る前にインスタンスサーバーを立ち上げ直す。

## 10. 本体ドキュメントとの同期

- `scripts/sync-docs.mjs` の `MANIFEST` に「本体のパス → hub のパス・説明・並び順」を書く。
- 先頭の H1 をタイトルに、相対リンクは同期済みページなら hub のパスへ、そうでなければ GitHub の URL へ。冒頭に「本体から同期」の注記。
- `pnpm sync-docs --check` で差分検知。`.github/workflows/sync-docs.yml` が毎週 PR を作る。
- 本体側で直すべきページに hub 側で手を入れると、次の同期で消える。編集リンク（各ページ右上）は本体の GitHub を指している。

## 11. 残っていること

1. ヒーロー用の動画（ワールドの様子・無音ループ・2MB 以内が目安）。`src/data/site.ts` の `heroVideo` に入れる
2. Cloudflare Pages のプロジェクト作成と `hub.ubichill.com` の DNS、Deploy Hook の Secret 登録
3. ロゴの SVG 化（3D を Three.js にするなら）
4. `/worlds/` `/servers/` の一覧ページ（連合サーバーの一覧 API ができてから）
5. 英語版
6. ワールドの JSON Schema 配布（本体の Zod スキーマから生成して `/schemas/` に置く）
