#!/usr/bin/env node
/**
 * ubichill 本体リポジトリのドキュメントを src/content/docs/docs/ に取り込む。
 *
 *   pnpm sync-docs            # ../ubichill（または UBICHILL_DIR）から取り込む
 *   pnpm sync-docs --check    # 取り込み結果が今のファイルと同じか確かめる（CI 用）
 *
 * 本体のチェックアウトが無ければ GitHub から浅く clone する（.cache/ubichill）。
 *
 * やること:
 *   - 先頭の H1 をタイトルにしてフロントマターを付ける（Starlight が H1 を描くので本文からは外す）
 *   - 相対リンクを、同期済みページなら hub のパスへ、そうでなければ GitHub の URL へ書き換える
 *   - ```mermaid を <pre class="mermaid"> にする（ブラウザ側で描く。MarkdownContent.astro を参照）
 *   - 冒頭に「本体から同期」の注記を入れる
 *
 * 取り込むファイルは下の MANIFEST で管理する。足すときはここに 1 行書くだけ。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_URL = 'https://github.com/ubichill/ubichill';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'src/content/docs/docs');
const RECORD = path.join(ROOT, 'src/content/synced.json');

/** @type {{ src: string; dest: string; description: string; order?: number; title?: string }[]} */
const MANIFEST = [
  // ワールドをつくる
  {
    src: 'docs/worlds/WORLD_AS_CODE.md',
    dest: 'create/world-as-code.md',
    order: 2,
    title: 'World as Code',
    description: 'ワールドを YAML で定義する考え方。ワールド＝URL、ステートレス、CRD 形式。',
  },
  {
    src: 'docs/worlds/FORMAT.md',
    dest: 'create/world-format.md',
    order: 3,
    title: 'ワールド定義フォーマット',
    description: 'world.yaml の正確なフィールド定義（ubichill.com/v1alpha1）。',
  },
  // mod をつくる
  {
    src: 'packages/sdk/README.md',
    dest: 'mods/sdk.md',
    order: 2,
    title: 'SDK（ubichill）',
    description: 'mod が import する npm パッケージ ubichill の使い方。',
  },
  {
    src: 'packages/cli/README.md',
    dest: 'mods/cli.md',
    order: 3,
    title: 'CLI（@ubichill/cli）',
    description: 'ubichill dev / build / install / verify / login / publish の使い方。',
  },
  {
    src: 'docs/API.md',
    dest: 'mods/api.md',
    order: 4,
    title: 'API リファレンス（Ubi.*）',
    description: 'Ubi.state / event / entity / ui / media / canvas / player の一覧。',
  },
  {
    src: 'docs/MOD.md',
    dest: 'mods/package.md',
    order: 5,
    title: 'mod パッケージ',
    description: 'mod.json、Component、配布、バージョンと lock、作者署名。',
  },
  {
    src: 'docs/MOD_RUNTIME.md',
    dest: 'mods/runtime.md',
    order: 6,
    title: 'mod の実行環境',
    description: 'WASM・バイナリ・同梱アセット・通信の境界。',
  },
  {
    src: 'docs/CAPABILITIES.md',
    dest: 'mods/capabilities.md',
    order: 7,
    title: '権限（capability）',
    description: 'mod が使える権限の一覧と危険度ティア。',
  },
  // サーバー
  {
    src: 'charts/ubichill/README.md',
    dest: 'servers/self-hosting.md',
    order: 3,
    title: 'セルフホスト（Helm）',
    description: 'Helm チャートで Kubernetes に Ubichill を建てる。',
  },
  {
    src: 'docs/Troubleshooting.md',
    dest: 'servers/troubleshooting.md',
    order: 4,
    title: 'トラブルシューティング',
    description: '動かないときに見るところ。',
  },
  // 内部設計
  {
    src: 'docs/ARCHITECTURE.md',
    dest: 'internals/architecture.md',
    order: 1,
    title: 'アーキテクチャ',
    description: '完全 CSR + Go/WebSocket、Worker サンドボックス、ECS。',
  },
  {
    src: 'docs/PROTOCOLS.md',
    dest: 'internals/protocols.md',
    order: 2,
    title: 'プロトコルと互換の規則',
    description: '約束ごとを 4 種類に分け、互換の扱いを決める。',
  },
  {
    src: 'docs/SERVICE_TOKEN.md',
    dest: 'internals/service-token.md',
    order: 3,
    title: 'サービストークン',
    description: 'サーバー間・サービス間の認証トークン。',
  },
  {
    src: 'CONTRIBUTING.md',
    dest: 'internals/contributing.md',
    order: 9,
    title: 'コントリビュート',
    description: '設計思想と PR の出し方。',
  },
  // リリースノート
  {
    src: 'packages/cli/CHANGELOG.md',
    dest: 'releases/cli.md',
    order: 1,
    title: '@ubichill/cli',
    description: 'CLI の変更履歴。',
  },
  {
    src: 'packages/sdk/CHANGELOG.md',
    dest: 'releases/sdk.md',
    order: 2,
    title: 'ubichill（SDK）',
    description: 'SDK の変更履歴。',
  },
];

const check = process.argv.includes('--check');

function locateRepo() {
  const fromEnv = process.env.UBICHILL_DIR;
  const candidates = [fromEnv, path.resolve(ROOT, '../ubichill')].filter(Boolean);
  for (const c of candidates) if (c && existsSync(path.join(c, 'package.json'))) return c;
  const cache = path.join(ROOT, '.cache/ubichill');
  if (!existsSync(cache)) {
    mkdirSync(path.dirname(cache), { recursive: true });
    console.log(`clone ${REPO_URL} → ${cache}`);
    execFileSync('git', ['clone', '--depth', '1', REPO_URL, cache], { stdio: 'inherit' });
  } else {
    execFileSync('git', ['-C', cache, 'pull', '--ff-only'], { stdio: 'inherit' });
  }
  return cache;
}

const repo = locateRepo();
const commit = execFileSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD']).toString().trim();
const destBySrc = new Map(MANIFEST.map((m) => [m.src, m.dest]));

/** 本体リポジトリ内のパス → hub のルート（同期済み）か GitHub の URL */
function linkFor(repoPath, hash) {
  const dest = destBySrc.get(repoPath);
  if (dest) return `/docs/${dest.replace(/\.md$/, '')}/${hash}`;
  return `${REPO_URL}/blob/main/${repoPath}${hash}`;
}

function rewriteLinks(body, srcPath) {
  const dir = path.posix.dirname(srcPath);
  // ![alt](rel) と [text](rel) の両方。http(s):, mailto:, #, / で始まるものは触らない
  return body.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (all, bang, text, href, title) => {
    if (/^(https?:|mailto:|#|\/)/.test(href)) return all;
    const [p, h = ''] = href.split('#');
    const hash = h ? `#${h}` : '';
    const repoPath = path.posix.normalize(path.posix.join(dir, p));
    if (bang) return `![${text}](https://raw.githubusercontent.com/ubichill/ubichill/main/${repoPath}${title ?? ''})`;
    return `[${text}](${linkFor(repoPath, hash)}${title ?? ''})`;
  });
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function convertMermaid(body) {
  return body.replace(
    /```mermaid\n([\s\S]*?)```/g,
    (_, code) => `<pre class="mermaid">\n${escapeHtml(code.trim())}\n</pre>`,
  );
}

function stripLeadingComments(body) {
  return body.replace(/^(\s*<!--[\s\S]*?-->\s*)+/, '');
}

function convert(entry) {
  const srcFile = path.join(repo, entry.src);
  let body = readFileSync(srcFile, 'utf8');
  body = stripLeadingComments(body);
  const h1 = body.match(/^# (.+)$/m);
  const title = entry.title ?? (h1 ? h1[1].replace(/`/g, '').trim() : path.basename(entry.src, '.md'));
  if (h1) body = body.replace(h1[0], '');
  body = rewriteLinks(body, entry.src);
  body = convertMermaid(body);
  body = body.trim();

  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(entry.description)}`,
    `source: ${JSON.stringify(entry.src)}`,
    `editUrl: ${JSON.stringify(`${REPO_URL}/edit/main/${entry.src}`)}`,
    entry.order !== undefined ? `sidebar:\n  order: ${entry.order}` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  const note =
    `:::note[ubichill 本体から同期]\n` +
    `このページは [\`${entry.src}\`](${REPO_URL}/blob/main/${entry.src}) を \`pnpm sync-docs\` で取り込んだもの。直すときは本体リポジトリへ。\n` +
    `:::`;

  return `${fm}\n\n${note}\n\n${body}\n`;
}

let changed = 0;
const record = { repo: REPO_URL, commit, syncedAt: new Date().toISOString().slice(0, 10), files: {} };
for (const entry of MANIFEST) {
  const out = convert(entry);
  const dest = path.join(OUT_DIR, entry.dest);
  record.files[entry.dest] = entry.src;
  const current = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
  if (current === out) continue;
  changed += 1;
  if (check) {
    console.log(`差分あり: ${entry.dest}`);
    continue;
  }
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, out);
  console.log(`書き込み: ${entry.dest}  ← ${entry.src}`);
}

if (!check) {
  const prev = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, 'utf8')) : null;
  if (!prev || prev.commit !== record.commit || changed > 0)
    writeFileSync(RECORD, `${JSON.stringify(record, null, 2)}\n`);
}

if (check && changed > 0) {
  console.error(`\n${changed} ファイルが本体と違います。pnpm sync-docs を実行してください。`);
  process.exit(1);
}
console.log(check ? '同期済み' : `完了（${changed} ファイル更新、本体 ${commit}）`);
