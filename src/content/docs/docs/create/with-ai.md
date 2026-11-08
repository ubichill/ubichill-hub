---
title: AI と一緒に作る
description: ワールドの YAML と mod の TypeScript を AI エージェントに書いてもらい、手元で動かして確かめる流れ。
sidebar:
  order: 4
---

ワールドは YAML、mod は TypeScript の、ふつうのファイルです。だから AI エージェント（Claude Code・Codex・Cursor など）に
「こういう部屋を作って」と頼めば、そのまま動くコードが返ってきます。このページは、AI に何を渡し、どう確かめるかをまとめます。

## AI に渡すもの

1. **このサイトの `llms.txt`**: [https://hub.ubichill.com/llms.txt](/llms.txt) に、ドキュメントの目次と本文へのリンクがあります。AI に「まずこれを読んで」と渡してください。
2. **仕様のページ**: ワールドなら [ワールド定義フォーマット](/docs/create/world-format/)、mod なら [SDK API](/docs/mods/api/) と [mod パッケージ](/docs/mods/package/)。URL を貼るだけで十分です。
3. **動いている例**: 本体リポジトリの [`worlds/`](https://github.com/ubichill/ubichill/tree/main/worlds) と [`mods/`](https://github.com/ubichill/ubichill/tree/main/mods) にある実物。
4. **やりたいこと**: 「ペンと動画プレイヤーがある作業部屋」「クリックすると数が増えるボタン」のように、画面の言葉で。

## ワールドを書いてもらう

最小のワールドはこれだけです。

```yaml
apiVersion: ubichill.com/v1alpha1
kind: World
metadata:
  name: chill-room          # 小文字英数と -（URL になる）
  version: 1.0.0
spec:
  displayName: チルな作業部屋
  capacity: { default: 10, max: 20 }
  environment:
    backgroundColor: "#F0F8FF"
    worldSize: { width: 2000, height: 1500 }
  dependencies:
    - name: pen
    - name: video-player
  initialEntities:
    - id: pentray
      transform: { x: 9, y: 7 }
      components:
        - type: pen:tray
```

AI に頼むときの文の例:

> `worlds/chill-room.yaml` を作って。ubichill.com/v1alpha1 の World。ペンのトレイを左上に、`core:media` のスクリーンを中央に置いて、
> 動画プレイヤーのコントロールをスクリーンの下に置いて、コントロールの `screen` 参照にスクリーンの Entity id を入れて。仕様は https://hub.ubichill.com/create/world-format/ を読んで。

ポイント:

- Component の型は `<modId>:<componentName>`。使う mod は `dependencies` に書きます。`core:*` は書きません。
- Component 同士をつなぐ参照は、`data` に相手の Entity の `id` を書きます。
- 上限: Entity 500・1 Entity に Component 32・YAML 100KB。

## mod を書いてもらう

mod は `src/*.worker.tsx` に、`export const config` と UI の `export default` を書きます。

```tsx
// src/like.worker.tsx
import type { ComponentConfig } from 'ubichill';

export const config: ComponentConfig = {
    defaultTransform: { w: 120, h: 40 },
};

const like = Ubi.state.define({
    count: Ubi.state.sync(0), // 全員で共有し、残る
});

export default function LikeButton() {
    return <button onClick={() => like.local.count++}>いいね {like.local.count}</button>;
}
```

AI に頼むときの文の例:

> ubichill の mod を作って。npm の `ubichill` が SDK、`@ubichill/cli` がビルドと開発サーバー。`src/like.worker.tsx` に、押すと全員で共有される数が増える
> 「いいね」ボタンを書いて。`Ubi.state.sync` で状態を持ち、UI は `export default` の関数で返す。API は https://hub.ubichill.com/mods/api/ を読んで。
> `tsconfig.json` の `jsxImportSource` は `ubichill`、`src/env.d.ts` に `declare const Ubi: import('ubichill').Ubi;` を置いて。

ポイント:

- `Ubi` はグローバルに注入されます。`import` せず、`env.d.ts` の型宣言で補います。
- `export default` の関数が読んだ `Ubi.state` の値は自動で追いかけられ、変わったときだけ描き直されます。
- 権限は宣言しなくても、使った API からビルド時に決まります（[権限リファレンス](/docs/mods/capabilities/)）。
- `fetch` は使えません。外部と通信するなら `Ubi.fetch` を使います（利用者がドメインごとに許可します）。

## 手元で動かして確かめる

```bash
npm install ubichill
npm install -D @ubichill/cli typescript
npx ubichill dev                 # mod だけなら world.yaml なしでよい（合成した部屋で動く）
npx ubichill dev worlds/chill-room.yaml
```

`http://localhost:3333/` を開くと、本番と同じ画面・同じ判定（lock・権限）で動きます。ファイルを保存すると、その mod だけビルドし直して画面が更新されます。
ビルドに失敗したら画面とターミナルに診断が出るので、それをそのまま AI に貼って直してもらってください。

:::tip[AI にターミナルも見せる]
`ubichill dev` の出力（`[build] ✗ ...` の行と esbuild のエラー）と、`npx tsc --noEmit` の結果を AI に渡すと、直しが速くなります。
:::

## 公開する

できあがったら、作者アカウントで署名して公開します。

```bash
npx ubichill login               # 1 回だけ。ブラウザで承認する
npx ubichill publish worlds/chill-room.yaml          # ワールドを Ubichill のサーバーへ
npx ubichill publish worlds/chill-room.yaml --out=dist  # GitHub Pages などに置くファイルを書き出す
npx ubichill build && npx ubichill publish dist      # mod の配布物に署名する
```

流れの全体は [署名して公開する](/docs/publish/) を見てください。CI（GitHub Actions）から公開する方法もあります。

## 関連ページ

- [ワールド定義フォーマット](/docs/create/world-format/) — フィールドの正確な定義
- [はじめての mod](/docs/mods/) — 15 分で動く mod のチュートリアル
- [SDK API](/docs/mods/api/) — `Ubi.*` のリファレンス
- [CLI](/docs/mods/cli/) — `ubichill` コマンドの一覧
