/** /llms-full.txt — ドキュメント全文を 1 つのテキストに */

import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = async ({ site: origin }) => {
  const docs = (await getCollection('docs')).sort((a, b) => a.id.localeCompare(b.id));
  const base = origin ?? new URL('https://hub.ubichill.com');
  const parts = [`# ${site.name}\n\n> ${site.tagline}\n`];
  for (const d of docs) {
    parts.push(`\n\n---\n\n# ${d.data.title}\n\nURL: ${new URL(`/${d.id}/`, base)}\n\n${d.body ?? ''}`);
  }
  return new Response(parts.join(''), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
