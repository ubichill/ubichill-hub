// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

const REPO = 'https://github.com/ubichill/ubichill';
const HUB_REPO = 'https://github.com/ubichill/ubichill-hub';

export default defineConfig({
  site: 'https://hub.ubichill.com',
  // v7 の既定 'jsx' はインライン要素のあいだの空白まで消す。文章中の <b>…</b> の前後の空白を残す
  compressHTML: true,
  // Mermaid は図のあるページでだけ読む大きなチャンク。警告の閾値を上げる
  vite: { build: { chunkSizeWarningLimit: 1500 } },
  integrations: [
    starlight({
      title: 'Ubichill',
      description: 'ワールドも mod も、自分で作って、自分で持てる。中央のない 2D メタバース。',
      // 日本語がルート。英語を足すときは `en: { label: 'English', lang: 'en' }` を追加する
      locales: { root: { label: '日本語', lang: 'ja' } },
      logo: { src: './src/assets/logo.png', alt: 'Ubichill' },
      favicon: '/favicon.png',
      customCss: ['./src/styles/panda.css', './src/styles/starlight.css'],
      social: [{ icon: 'github', label: 'GitHub', href: REPO }],
      editLink: { baseUrl: `${HUB_REPO}/edit/main/` },
      lastUpdated: true,
      components: {
        SocialIcons: './src/components/starlight/SocialIcons.astro',
        MarkdownContent: './src/components/starlight/MarkdownContent.astro',
      },
      head: [
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://hub.ubichill.com/og.png' } },
      ],
      sidebar: [
        { label: 'ドキュメント', slug: 'docs' },
        { label: 'はじめに', items: [{ slug: 'docs/getting-started' }, { slug: 'docs/concepts' }] },
        { label: 'ワールドをつくる', items: [{ autogenerate: { directory: 'docs/create' } }] },
        { label: 'mod をつくる', items: [{ autogenerate: { directory: 'docs/mods' } }] },
        { label: '公開する', items: [{ slug: 'docs/publish' }] },
        { label: 'サーバー', items: [{ autogenerate: { directory: 'docs/servers' } }] },
        { label: '内部設計', items: [{ autogenerate: { directory: 'docs/internals' } }], collapsed: true },
        { label: 'リリースノート', items: [{ autogenerate: { directory: 'docs/releases' } }], collapsed: true },
      ],
    }),
  ],
});
