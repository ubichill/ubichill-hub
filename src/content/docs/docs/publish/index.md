---
title: 署名して公開する
description: 作者アカウントと公開環境のしくみ、Web・CLI・CI から公開する手順、置き場所の選び方、取り消しの意味。
sidebar:
  order: 1
---

Ubichill では、ワールドも mod も**作者が手元で署名して**公開します。サーバーは秘密鍵を預かりません。
署名があるから、置き場所がどこでも「その作者が作り、改ざんされていない」ことを確かめられます。

## 3 つの言葉

| 言葉 | 意味 |
|---|---|
| 作者アカウント | `ID@ドメイン`（表示は `@yokan@ubichill.com`）。どこかのサーバーに実在するアカウント |
| 公開環境 | 署名して公開できる環境。**ブラウザ・CLI・CI** の 3 種類。それぞれ鍵を 1 本持つ |
| 作者署名 | ワールドや mod の内容に対する Ed25519 の署名。作者アカウントが必ず入る |

1 つのアカウントに公開環境を何個でも登録できます。サーバーが持つのは公開鍵だけで、秘密鍵はそれぞれの環境の手元にあります。

:::note[「作者署名あり」が保証すること]
その作者が作り、内容が変わっていないこと。安全性の保証ではありません（鍵はだれでも作れます）。
安全性は、サンドボックス・権限の確認・lock が担います。画面でも「検証済み」とは呼ばず「作者署名あり」と表示します。
:::

## 何が公開されるか

- **署名が確認できたワールド**だけが、ワールドの一覧・連合の一覧・プロフィール・インスタンスの一覧に出ます。
- 署名のないワールドは、URL を直接開けば入れますが、入る前に確認の画面が出ます。
- **mod は署名が必須**です。署名がない・作者を確認できない mod を、本番の Host は実行しません。
- 署名が有効なのは、ワールドが使う mod がすべて lock に固定されているときだけです。固定できない mod があると公開できません。

## Web から公開する（ブラウザ）

ワールドエディタで「公開する」を押すだけです。

1. このブラウザが公開環境でなければ、**自動で鍵を作り、公開環境として登録**します（ログインできる＝公開できる、なので確認は出ません）。
2. ID をまだ決めていなければ、その場で決めます。
3. 署名して公開します。次回からは「公開する」だけです。

ブラウザのデータを消すと、その公開環境の鍵は使えなくなります（一覧には残ります）。次に公開するとき、自動で新しい環境が追加されます。

## CLI から公開する

```bash
npx ubichill login                    # ブラウザで承認。この端末を公開環境にする
npx ubichill whoami                   # サーバー・作者アカウント・公開環境を確かめる
```

`login` は手元で鍵を作り、ブラウザで承認を受けます。ブラウザを開けない環境では `--device` を付けると、表示されたコードを別の端末のブラウザで承認できます。
認証情報は `~/.config/ubichill/credentials.json`（0600）にサーバーごとに保存されます。別のサーバーに公開するなら `--server=https://your.server` を付けます。

### ワールド

```bash
npx ubichill publish worlds/chill-room.yaml
```

mod の固定（`install`）・作者アカウント付きの署名・公開を一度に行います。
「同じ作者・同じ `metadata.name`」なら同じワールドの更新になるので、初回も更新も同じコマンドです。
`metadata.name` を変えて公開すると名前の変更（URL の移動）になり、以前の URL からもたどれます。

### mod

```bash
npx ubichill build
npx ubichill publish dist                       # 複数 mod の一括ビルドなら dist/mods
npx ubichill verify --dist-dir=dist --require-signatures
```

`publish <ビルド出力>` は `v<version>/lock.sig.json` を書き出します。mod はサーバーへは送りません。署名済みの出力をそのまま GitHub Pages などに置きます。
`--public-url=<公開先の URL>` を付ける（または `package.json` の `homepage` に書く）と、ユーザーページの「公開している mod」に出ます。

## CI から公開する（GitHub Actions など）

CI ではブラウザを開けないので、**手元で 1 回だけ** CI 用の公開環境を作り、その認証情報を Secret に入れます。

```bash
npx ubichill ci create --name="GitHub Actions: owner/repo"
```

ブラウザで承認すると、鍵・API トークン・サーバー・アカウントをまとめた 1 本の文字列が表示されます（この場限り。手元にもサーバーにも鍵は残りません）。
これを Secret `UBICHILL_CREDENTIALS` に入れます。

```yaml
# .github/workflows/publish.yml（抜粋）
      - run: npm ci
      - run: npx ubichill build
      - run: npx ubichill publish dist
        env:
          UBICHILL_CREDENTIALS: ${{ secrets.UBICHILL_CREDENTIALS }}
      - run: npx ubichill verify --dist-dir=dist --require-signatures
      # このあと dist を GitHub Pages などへ置く
```

ワールドなら `npx ubichill publish worlds/my-world.yaml`（サーバーへ）か `--out=dist/`（外部へ）です。

CI 用の公開環境は、CLI のトークンからは作れません。鍵を増やすのは必ずブラウザの承認です（盗まれたトークンから鍵を増やさせないため）。

## 置き場所を選ぶ

ワールドは「定義（YAML）・lock・署名」の 3 つの組で配られます。置き場所によって形は変わりません。

| 置き場所 | やり方 | 共有 URL |
|---|---|---|
| Ubichill のサーバー | Web の「公開する」、または `ubichill publish world.yaml` | `https://<サーバー>/@<ID>/<name>` |
| GitHub Pages・自分のサーバー・静的ホスト | `ubichill publish world.yaml --out=<dir>` で `world.yaml` / `.lock.json` / `.sig.json` を書き出して置く | その YAML の URL |

外部に置く場合、署名ファイル `<world>.sig.json` と lock `<world>.lock.json` は、YAML と同じ場所に**兄弟ファイル**として置きます。
mod の配布先と作者のサーバーは、利用者のブラウザが直接読みに行くので `Access-Control-Allow-Origin: *` を返す必要があります（GitHub Pages と Ubichill のサーバーは返します）。

```json
{
  "format": "ubichill-signature",
  "version": 2,
  "kind": "world",
  "alg": "ed25519",
  "publicKey": "<base64url>",
  "author": "yokan@ubichill.com",
  "subject": "chill-room",
  "subjectVersion": "1.0.0",
  "contentHash": "sha256-...",
  "signature": "<base64url>"
}
```

署名の対象に置き場所（URL）は含まれません。同じファイルをどこに置いても、同じ署名で確かめられます。
ワールドの同一性は「作者 + `metadata.name`」で決まり、URL が変わっても同じワールドです。

## 公開環境を管理する

設定 → 公開に、「公開できるブラウザ・CLI・CI」の一覧があります。

- 種類（ブラウザ・CLI・CI）、名前、追加日、最終利用が出ます。長く使われていない環境は目立つように表示されます。
- 新しい公開環境が追加されると、メールで知らせます。心当たりがなければ、漏えいとして取り消してください。
- CLI からは `ubichill logout` で、その端末の公開環境を取り消して認証情報を消せます。

## 取り消しの意味

公開環境を取り消すと、その鍵の署名は**取り消し前のものも含めてすべて無効**になります。署名には信頼できる時刻が入らないため、
「取り消し前に署名したことにした」偽物を見分けられないからです。

- **ふつうの交換**（新しい PC に移るなど）: 新しい環境を追加 → 作品を署名し直す → 古い環境を取り消す。この順なら作品は途切れません。
- **紛失・漏えい**: 直ちに取り消す → Ubichill のサーバーに置いたワールドは「署名し直しが必要」になり非公開 → 現役の環境でまとめて署名し直す。
  漏えいの場合は、攻撃者が中身を書き換えていないかエディタで確かめてから 1 つずつ署名し直します。
- **外部ホストに置いた作品**: 署名ファイルを置き直す必要があります。CI で公開していれば、Secret を差し替えて再実行すれば新しい鍵で署名し直されます。

ほかのサーバーに取り消しが届くまで、少し時間がかかります（作者のサーバーが動いていれば 1 時間ほど、さらにキャッシュの 5 分）。

## 公式のワールドと mod

本体に同梱されるワールド・mod も、ほかの作者と同じ方法で、公式アカウント `ubichill@ubichill.com` の CI 用公開環境が署名します。
公式だからといって特別な信用はありません。鍵の確認もほかの作者と同じく WebFinger で行われます。

## 関連ページ

- [CLI](/docs/mods/cli/) — `login` / `publish` / `ci create` / `verify` のオプション
- [ワールド定義フォーマット](/docs/create/world-format/) — 署名ファイルと兄弟ファイルの規則
- [mod パッケージ](/docs/mods/package/) — mod の署名と lock の関係
- [しくみと用語](/docs/concepts/) — 作者署名・公開環境・lock
