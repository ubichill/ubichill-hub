/**
 * /llms.txt — AI エージェント向けの目次（https://llmstxt.org/ の形式）。
 * ドキュメントのコレクションから自動生成する。
 */

import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = async ({ site: origin }) => {
  const docs = (await getCollection('docs')).sort((a, b) => a.id.localeCompare(b.id));
  const base = origin ?? new URL('https://hub.ubichill.com');
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.tagline}`,
    '',
    'Ubichill は URL を開くだけでカーソルがアバターになる 2D メタバース。',
    'ワールドは YAML（World as Code）、機能は TypeScript で書く mod。どちらも URL で配り、作者署名で本物とわかる。',
    'サーバー同士は ActivityPub の形で連合する。',
    '',
    `- アプリ: ${site.app}`,
    `- ソース: ${site.repo}`,
    `- 全文: ${new URL('/llms-full.txt', base)}`,
    '',
    '## ドキュメント',
    '',
    ...docs.map(
      (d) => `- [${d.data.title}](${new URL(`/${d.id}/`, base)})${d.data.description ? `: ${d.data.description}` : ''}`,
    ),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
