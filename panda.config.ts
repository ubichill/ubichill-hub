import { defineConfig } from '@pandacss/dev';
import { keyframes, semanticTokens, textStyles, tokens } from './src/design/tokens';

export default defineConfig({
  // Panda 2 は presets を明示しないと、ユーティリティ・条件（_hover など）・ブレークポイントが入らない
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // リセット CSS は入れない（ランディングは src/styles/global.css、ドキュメントは Starlight が持つ）
  preflight: false,
  include: ['./src/**/*.{astro,ts,tsx,mdx}'],
  exclude: [],
  outdir: 'styled-system',
  // ダークモードは Starlight と同じ属性で切り替える
  conditions: {
    extend: {
      dark: '[data-theme="dark"] &',
      light: '[data-theme="light"] &',
    },
  },
  theme: {
    extend: { tokens, semanticTokens, textStyles, keyframes },
  },
});
