# hub.ubichill.com デザイン案 — 制作ブリーフ

各案は **1 ファイル完結の HTML**（`mockups/<id>.html`）。ビルドなし・CSS は `<style>` に直書き。
`python3 -m http.server` で `mockups/` を配信して見る（ES module を使うため file:// では動かない）。

## 共通ルール

- 文言は日本語（下の「共通コピー」を使い回す。言い回しは案のトーンに合わせて調整してよい）
- **絵文字禁止**（ubichill 本体の方針）。アイコンはインライン SVG（lucide 風の 24px stroke アイコン）
- ファイル冒頭の `:root` に **デザイントークンを CSS 変数で定義** し、本文では変数だけを使う
  （後で PandaCSS の `tokens` / `semanticTokens` に移植するため）。命名は Panda に寄せる:
  - 基本トークン: `--colors-<palette>-<step>`（例 `--colors-periwinkle-400`）、`--radii-*`、`--fonts-*`、`--shadows-*`、`--spacing-*`
  - セマンティック: `--colors-bg`, `--colors-bg-surface`, `--colors-fg`, `--colors-fg-muted`, `--colors-accent`, `--colors-accent-fg`, `--colors-border` など
- ファイル先頭の `<!-- -->` コメントに「案名 / コンセプト / 狙い / 向いている点・弱い点」を書く
- 画面右下に小さな「案ラベル」（例: `案A · Hub Classic`）と `index.html` へ戻るリンクを固定表示
- レスポンシブ（~375px のスマホ幅で崩れないこと）。`prefers-reduced-motion` を尊重
- Google Fonts は CDN 読み込みで OK（日本語フォントは Noto Sans JP / M PLUS Rounded 1c / Zen Maru Gothic / Zen Kaku Gothic New / Shippori Mincho / BIZ UDPGothic など）
- 外部 JS ライブラリは使わない（共有部品のみ）

## 共有素材 `mockups/assets/`

| ファイル | 内容 |
|---|---|
| `logo.png` | 正式アイコン（白背景 1024px） |
| `logo-transparent.png` / `-sm.png` | 透過ロゴ（667×761 / 半分） |
| `logo-layer-{blue,peri,lav}.png` | ロゴを色ごとに分解した透過レイヤー（3D 用） |
| `app-editor.png` | 実際のアプリ画面（ワールドエディタ、2513×1295）。「実際に使っている画像」枠 |
| `logo3d.js` | 3D ロゴ。`<div data-logo3d style="width:360px;aspect-ratio:667/761">`。属性は冒頭コメント参照（depth / thickness / tilt / spin / gloss / shadow / mode / shade） |
| `world.js` | 動くミニワールド（NPC カーソルが動く・描く・動画前に集まる。訪問者もドラッグで描ける）。`<div data-world style="height:520px">`。属性: theme(light/cream/dark/transparent) cursors video notes tray hud you frame grid |

読み込み: `<script type="module" src="./assets/logo3d.js"></script>` / `<script type="module" src="./assets/world.js"></script>`

> ヒーローは「ubichill の実際の画面」＋「3D ロゴ」が基本。実際の画面は `app-editor.png` か `world.js`
> （本番では実際のワールドのスクリーンショット/動画に差し替える前提）。

## ブランドの手がかり

- ロゴ色: light blue `#bde1fb` / periwinkle `#9ab2f8` / lavender `#ceb0fa`（パステル 3 色、手が「U」の形）
- アプリ本体のトークン: navy `#1b2a44`（primary・文字）/ highlight `#4780e0` / cream `#faf6f0`（bg）/ surface `#f5ecdf` / border `#cebca2` / muted `#56627a`
- ワールド既定背景 `#F0F8FF`
- フォント: アプリ本体は Inter + system
- ムード: 「チル」「ゆるい繋がり」「軽い」「ブラウザ 1 つ」「Web の思想・中央集権を避ける」

## 共通コピー（素材）

**ナビ**: ドキュメント / ワールド / mod / サーバー / ニュース ＋ 言語切替・GitHub・［アプリを開く］

**ヒーロー見出し候補**
- `Draw. Watch. Chill. with Ubichill.`（Misskey Hub 風）
- `カーソルで、そこにいる。`
- `同じ空間で、作業も会話もいっしょに。`（アプリのログイン画面の文言）
- `URL をひらくだけで、みんなのいる場所へ。`

**リード**: Ubichill は、みんなのカーソルが集まって、描いたり、観たり、いっしょに過ごす Web スペース。
URL を開くだけ。インストール不要、機能は誰でも URL で追加できる。

**お知らせピル（仮）**: 「サーバー間の連合（federation v1）に対応しました」

**CTA**: ［アプリを開く］(https://ubichill.com/) ／［詳しく知る］／［自分のサーバーを建てる］

**3 つ（〜4 つ）の柱**
1. カーソルだけのゆるい繋がり — 顔出しも声出しもなし。お互いの動線だけが伝わる、ちょうどいい存在感。
2. URL をひらくだけ — インストール不要。低スペックな PC やスマホからでも、ブラウザ 1 つで 1 秒で。
3. mod でなんでも足せる — ペン・動画・付箋…ワールドの機能は URL から読み込む mod。ゼロトラストの Worker サンドボックスで安全に動く。
4. 中央を持たない — サーバー同士が連合。どのサーバーの人ともフレンドになり、相手の部屋に入れる。

**はじめる（4〜5 項目）**
- アプリを開く — ubichill.com でアカウントを作ってすぐ入る
- 自分のサーバーを建てる — Helm チャート 1 つで k8s に
- mod をつくる — npm の `ubichill`（SDK）と `@ubichill/cli`（`npx ubichill dev`）
- ワールドを書く — World as Code（YAML）
- 開発に参加する — GitHub。PR は日本語歓迎

**こんな使い方**: もくもく作業会 / 動画・映画の同時視聴 / お絵描き・ホワイトボード / イベント・展示・勉強会

**ワールドでできること（機能カード素材）**: カーソルアバター（.cur のカーソルテーマ）/ ペン・消しゴム / 動画・ライブの同時視聴 / 付箋 / 弾幕 / スマホコントローラー / ホームワールドとランチパッド / フレンド・招待・リクエストインバイト / 公開範囲 4 種（パブリック・フレンド+・フレンドのみ・招待のみ）

**開発者向け素材**

```yaml
# worlds/chill-room.yaml
apiVersion: ubichill.com/v1alpha1
kind: World
metadata:
  name: chill-room
  version: "1.0.0"
spec:
  displayName: チルな作業部屋
  capacity: { max: 20, default: 10 }
  dependencies:
    - name: pen
    - name: video-player
  initialEntities:
    - id: pentray
      components:
        - type: pen:tray
```

```tsx
// mods/like/src/button.worker.tsx（SDK README の書き方）
const like = Ubi.state.define({
  count: Ubi.state.sync(0), // 共有＋永続
});

export default function LikeButton() {
  return <button onClick={() => like.local.count++}>いいね {like.local.count}</button>;
}
```

```bash
helm repo add ubichill https://ubichill.github.io/ubichill
helm install ubichill ubichill/ubichill -n ubichill --create-namespace \
  --set global.domain=<your-domain>
```

- 権限: 危険度ティア（safe / sensitive / dangerous）、初回使用時にブラウザのカメラ許可のように確認、権限はビルド時に静的解析で自動導出
- 連合: ActivityPub（AS2）の形。部屋の住所は `<部屋ID>@<domain>`。Ed25519 + RFC 9421 署名
- アーキテクチャ: 完全 CSR（Vite）+ Go の WebSocket インスタンスサーバー
- ライセンス: AGPL-3.0（独立した mod には追加的許可）

**フッター**: ドキュメント / API / Roadmap / Architecture / GitHub / ライセンス / © Ubichill Project

## ページの骨格（Misskey Hub を参考にした推奨順。案ごとに組み替え可）

1. ヘッダー
2. ヒーロー（見出し・リード・お知らせピル・CTA 2 つ・3D ロゴ・実画面）
3. 柱 3〜4 枚（ヒーロー下端に食い込ませる等）
4. はじめる（4〜5 項目）
5. こんな使い方 / ワールドでできること
6. 開発者向け（mod / World as Code / 権限）
7. 連合・セルフホスト
8. オープンソース（GitHub・コントリビュート）
9. フッター

## 案一覧

| id | 名前 | 方向性 |
|---|---|---|
| a-hub-classic | Hub Classic | Misskey Hub に最も近い。角丸の大きなヒーローカード、パステルの円形ブロブ、左に見出し・右に 3D ロゴ、柱カードがヒーロー下端に食い込む。cream + navy + ロゴ 3 色 |
| b-live-world | Live World | ヒーロー全面が動くワールド（world.js）。見出しはガラスのカードで浮かせ、3D ロゴも空間に浮かぶ。「訪問者のカーソルもアバターになる」を体験させる |
| c-pastel-dream | Pastel Dream | ロゴ 3 色のメッシュグラデーション + グラスモーフィズム。中央に大きな 3D ロゴ、その下にパースで傾けた実画面（app-editor.png）。ふわっとした柔らかさ |
| d-night-chill | Night Chill | 深いネイビーの夜。lo-fi / 作業 BGM の空気感。星・グレイン・発光するパステルのロゴ。「夜の作業通話」 |
| e-bento | Bento | ベントーグリッド。ヒーロー自体がタイルの集合（ロゴ / 実画面 / YAML / helm / 連合図 / 権限）。情報量が多くても整理されて見える |
| f-editorial | Editorial | 雑誌・紙もの。明朝体の大見出し、生成りの紙、非対称レイアウト、番号付きの章立て。3D ロゴは端で大きく切れる。落ち着いた「チル」 |
| g-developer | Developer | 開発者・セルフホスター向け。ターミナル/コード主役の分割ヒーロー（YAML・helm・SDK をタブ切替）、等幅アクセント。Astro / Deno 系の LP |
| h-playful | Playful | ステッカー・手描き。太い輪郭線、丸ゴシック、ペンの落書き SVG、ゆらゆら動くカーソル。コミュニティ・遊び心 |
| i-minimal | Minimal | 白基調・余白多め・アクセント 1 色（periwinkle）。小さめの 3D ロゴと大きな実画面。スクロールで静かにフェードイン |
| j-federation | Federation | 連合が主役。サーバー（ノード）がつながる星座のようなヒーロー、カーソルがノード間を移動。「どのサーバーの人とも、同じ部屋に」。サーバー一覧セクション付き |
| k-own-your-world | Own Your World | **A × J の統合案（採用候補）**。A のヒーロー＋「自分で持てる」「分散」。文章は最小限、カーソル演出なし |
