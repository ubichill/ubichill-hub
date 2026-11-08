---
title: はじめての mod
description: npm の ubichill と @ubichill/cli を入れて、押すと数が増えるボタンを作り、手元で動かすまで。15 分。
sidebar:
  order: 1
---

mod は、ワールドに置ける機能の部品です。TypeScript で書き、利用者のブラウザの Worker（サンドボックス）の中で動きます。
ここでは「押すと全員で数が増えるボタン」を作って、手元で動かすところまでやります。

## 用意するもの

- Node.js（`@ubichill/cli` が動く版）と npm
- エディタ。TypeScript の補完が効くもの

Docker・データベース・Go のツールチェーンは要りません。

## 1. プロジェクトを作る

```bash
mkdir like-mod && cd like-mod
npm init -y
npm install ubichill
npm install -D @ubichill/cli typescript
```

| パッケージ | 役割 |
|---|---|
| `ubichill` | SDK。mod が `import` するのはこれだけ。依存ゼロ |
| `@ubichill/cli` | `ubichill` コマンド。開発サーバー・ビルド・固定・検証・署名・公開。Go のインスタンスサーバーも一緒に入る |

`package.json` を次のようにします。`name` が mod の ID になります（`@ubichill/mod-` の接頭辞は外されます。別の ID にしたいときは `"ubichill": { "id": "like" }` を足します）。

```json
{
    "name": "like",
    "version": "0.1.0",
    "private": true,
    "dependencies": { "ubichill": "^4" },
    "devDependencies": { "@ubichill/cli": "^1", "typescript": "^5" },
    "scripts": {
        "dev": "ubichill dev",
        "typecheck": "tsc --noEmit",
        "build": "npm run typecheck && ubichill build"
    }
}
```

:::note[版の数字]
`ubichill` と `@ubichill/cli` の版は npm で確かめてください。[ubichill](https://www.npmjs.com/package/ubichill) / [@ubichill/cli](https://www.npmjs.com/package/@ubichill/cli)
:::

## 2. 設定ファイル

`tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "es2022",
        "lib": ["ES2022", "WebWorker"],
        "module": "esnext",
        "moduleResolution": "bundler",
        "strict": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "jsxImportSource": "ubichill"
    },
    "include": ["src"]
}
```

`src/env.d.ts`（`Ubi` はグローバルに注入されるので、型だけ宣言します）:

```ts
declare const Ubi: import('ubichill').Ubi;
```

## 3. Component を書く

`src/button.worker.tsx`:

```tsx
import type { ComponentConfig } from 'ubichill';

// このファイルが 1 つの Component になる。ID は "like:button"
export const config: ComponentConfig = {
    defaultTransform: { x: 0, y: 0, w: 140, h: 44 },
    dataFields: {
        label: { type: 'string', default: 'いいね', label: 'ボタンの文字' },
    },
};

// 状態。sync を付けた値は、この Entity を見ている全員で共有され、部屋が続く間残る
const like = Ubi.state.define({
    count: Ubi.state.sync(0),
    label: Ubi.state.sync('いいね'),
});

// export default が UI。読んだ Ubi.state の値が変わると自動で描き直される
export default function LikeButton() {
    return (
        <button onClick={() => like.local.count++}>
            {like.local.label} {like.local.count}
        </button>
    );
}
```

決まりごと:

- ファイル名は `*.worker.ts` か `*.worker.tsx`。`export const config` を持つファイルだけが Component としてビルドされます。
- Component の型は `<mod の ID>:<ファイル名から .worker を外したもの>`。ここでは `like:button`。
- `dataFields` に書いたものは、ワールドエディタのインスペクターで作者が編集できるようになります。
- UI は `export default` の関数が返します。`onClick` などのハンドラは Worker の中で動きます。

## 4. 手元で動かす

```bash
npm run dev
```

```
  ubichill dev  v1.1.0  ready in 447 ms

  ➜  Local:   http://localhost:3333/
```

`http://localhost:3333/` を開くと、`like:button` を 1 つ置いた部屋が自動で作られ、ボタンが出ます。
別のタブでも開いて押してみてください。数が同期します。

- ファイルを保存すると、その mod だけビルドし直して画面が更新されます。共有している状態（数）は残ります。
- ビルドに失敗したら前の版が動き続け、失敗の内容が画面とターミナルに出ます。
- スマートフォンから試すには `ubichill dev --host` で LAN に公開します。

自分のワールドに置いて試すなら、`world.yaml` を書いて `ubichill dev world.yaml` とします（[ワールド定義フォーマット](/docs/create/world-format/)）。
手元でビルドした mod は、`dependencies` に `source.url` が書いてあっても手元のものが使われます。

## 5. 権限はどう決まるか

このボタンは `Ubi.state.sync` と `export default` を使っているので、ビルド時に `scene:read`・`scene:update`・`ui:render` が自動で付きます。
開発者が宣言する必要はありません。

| ティア | 既定の動き | 例 |
|---|---|---|
| safe | 確認なしで許可 | UI の描画、シーンの読み取り、イベントの送信 |
| sensitive | 既定で許可（利用者が「要承認」に変えられる） | シーンの変更、ブロードキャスト、キャンバス描画、メディアの制御 |
| dangerous | 利用者の明示的な承認が要る | 外部通信（`Ubi.fetch`）、外部サービスへの身元証明 |

外部と通信するなら `Ubi.fetch` を使います。接続先のドメインごとに利用者が許可します。素の `fetch` は Worker の中では使えません。
一覧は [権限リファレンス](/docs/mods/capabilities/) にあります。

## 6. ビルドと検証

```bash
npm run build                    # tsc --noEmit → ubichill build
npx ubichill verify --dist-dir=dist
```

`dist/v0.1.0/` に `manifest.json`（実行用）と `lock.json`（バイト列のハッシュと権限の上限）ができます。
`verify` は、配るバイト列と `lock.json` が一致するかを独立に計算し直して確かめます。

## 7. 公開する

mod の配布物には作者アカウントの署名が必須です。署名のない mod を本番の Host は実行しません。

```bash
npx ubichill login                             # 1 回だけ。ブラウザで承認する
npx ubichill publish dist                      # dist/v0.1.0/lock.sig.json を書き出す
npx ubichill verify --dist-dir=dist --require-signatures
```

`dist` の中身を GitHub Pages などに置けば完成です。ワールドの作者は `dependencies[].source.url` にその URL を書いて使います。
`--public-url=https://あなた.github.io/like` を付けると、あなたのユーザーページの「公開している mod」に出ます。

署名・公開環境・CI からの公開は [署名して公開する](/docs/publish/) にまとめてあります。

## 次に読む

- [SDK API](/docs/mods/api/) — `Ubi.state`・`Ubi.event`・`Ubi.entity`・`Ubi.ui` などの全体
- [SDK README](/docs/mods/sdk/) — ネームスペースの一覧と JSX の使い方
- [CLI](/docs/mods/cli/) — `ubichill dev / build / install / verify / publish` の詳細
- [mod パッケージ](/docs/mods/package/) — manifest・lock・配布の形式
- [実行環境](/docs/mods/runtime/) — WASM・同梱アセット・バイナリ通信
