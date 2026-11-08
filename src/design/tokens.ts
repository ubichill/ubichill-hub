/**
 * デザイントークン（PandaCSS）
 *
 * 3 層で持つ。
 * - tokens        : 生の値（色のパレット・フォント・角丸・影）。コンポーネントから直接使わない
 * - semanticTokens: 役割（bg / fg / accent / border …）。明暗はここで切り替える（`_dark`）
 * - textStyles    : 見出し・リードなどの文字組み
 *
 * 将来 ubichill 本体と共有するときは、このファイルを `@ubichill/panda-preset` として切り出す。
 * ダークモードは `<html data-theme="dark">`（Starlight と同じ属性）で切り替える。
 */
import { defineKeyframes, defineSemanticTokens, defineTextStyles, defineTokens } from '@pandacss/dev';

export const tokens = defineTokens({
  colors: {
    // ロゴの 3 色（パステル。白地では文字に使わない）
    sky: { 100: { value: '#e3f2fd' }, 200: { value: '#bde1fb' }, 700: { value: '#2f7fb8' } },
    periwinkle: {
      100: { value: '#e3e9fd' },
      300: { value: '#9ab2f8' },
      400: { value: '#b3c5fa' },
      700: { value: '#4352c9' },
    },
    lavender: { 100: { value: '#f1e8fe' }, 300: { value: '#ceb0fa' }, 700: { value: '#7a4fd0' } },
    // アプリ本体の cream + navy
    cream: {
      50: { value: '#fdfbf7' },
      100: { value: '#faf6f0' },
      200: { value: '#f5ecdf' },
      300: { value: '#ede4d6' },
      400: { value: '#cebca2' },
    },
    navy: {
      50: { value: '#f8f3ea' },
      100: { value: '#e8ecf6' },
      200: { value: '#a9b3c9' },
      300: { value: '#9ea7bd' },
      400: { value: '#6f7b96' },
      500: { value: '#56627a' },
      700: { value: '#263d68' },
      800: { value: '#1f2b45' },
      850: { value: '#182238' },
      900: { value: '#1b2a44' },
      950: { value: '#121c30' },
      975: { value: '#0f1729' },
      1000: { value: '#0a1120' },
    },
    blue: { 500: { value: '#4780e0' } },
    green: { 100: { value: '#e6f5ea' }, 400: { value: '#8ad29b' }, 700: { value: '#1e7e46' } },
    yellow: { 300: { value: '#f1c86c' } },
    red: { 500: { value: '#c0392b' } },
    white: { value: '#ffffff' },
  },
  fonts: {
    heading: { value: '"Nunito Variable", "M PLUS Rounded 1c", system-ui, sans-serif' },
    body: { value: '"M PLUS Rounded 1c", "Nunito Variable", system-ui, sans-serif' },
    mono: { value: '"JetBrains Mono Variable", ui-monospace, Menlo, monospace' },
  },
  radii: {
    sm: { value: '10px' },
    md: { value: '16px' },
    lg: { value: '24px' },
    xl: { value: '36px' },
    full: { value: '999px' },
  },
  sizes: {
    container: { value: '1160px' },
    wide: { value: '1400px' },
  },
  durations: {
    fast: { value: '150ms' },
    normal: { value: '220ms' },
  },
});

export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      DEFAULT: { value: { base: '{colors.cream.100}', _dark: '{colors.navy.975}' } },
      surface: { value: { base: '{colors.white}', _dark: '{colors.navy.850}' } },
      subtle: { value: { base: '{colors.cream.200}', _dark: '{colors.navy.800}' } },
      hero: { value: { base: '#eceef8', _dark: '#141d33' } },
      // 暗い帯（mod セクション）。ダークでは背景よりさらに暗く
      inverse: { value: { base: '{colors.navy.900}', _dark: '{colors.navy.1000}' } },
      code: { value: { base: '{colors.navy.950}', _dark: '#070c18' } },
      glass: { value: { base: 'rgba(255, 255, 255, 0.78)', _dark: 'rgba(24, 34, 56, 0.78)' } },
      header: { value: { base: 'rgba(250, 246, 240, 0.82)', _dark: 'rgba(15, 23, 41, 0.82)' } },
    },
    fg: {
      DEFAULT: { value: { base: '{colors.navy.900}', _dark: '{colors.navy.100}' } },
      muted: { value: { base: '{colors.navy.500}', _dark: '{colors.navy.200}' } },
      subtle: { value: { base: '{colors.navy.300}', _dark: '{colors.navy.400}' } },
      // 暗い帯の上の文字（明暗どちらでも明るい）
      inverse: { value: '{colors.navy.50}' },
      inverseMuted: { value: 'rgba(248, 243, 234, 0.7)' },
    },
    accent: {
      DEFAULT: { value: { base: '{colors.navy.900}', _dark: '{colors.periwinkle.300}' } },
      hover: { value: { base: '{colors.navy.700}', _dark: '{colors.periwinkle.400}' } },
      fg: { value: { base: '{colors.navy.50}', _dark: '{colors.navy.975}' } },
    },
    highlight: { value: { base: '{colors.blue.500}', _dark: '{colors.periwinkle.300}' } },
    link: { value: { base: '{colors.periwinkle.700}', _dark: '{colors.periwinkle.400}' } },
    border: {
      DEFAULT: { value: { base: 'rgba(27, 42, 68, 0.10)', _dark: 'rgba(255, 255, 255, 0.10)' } },
      strong: { value: { base: 'rgba(27, 42, 68, 0.18)', _dark: 'rgba(255, 255, 255, 0.18)' } },
    },
    // アイコンの下地など、ロゴ色の淡い面
    tint: {
      sky: { value: { base: '{colors.sky.100}', _dark: 'rgba(189, 225, 251, 0.14)' } },
      periwinkle: { value: { base: '{colors.periwinkle.100}', _dark: 'rgba(154, 178, 248, 0.16)' } },
      lavender: { value: { base: '{colors.lavender.100}', _dark: 'rgba(206, 176, 250, 0.16)' } },
      green: { value: { base: '{colors.green.100}', _dark: 'rgba(138, 210, 155, 0.16)' } },
    },
    status: {
      ok: { value: { base: '{colors.green.700}', _dark: '{colors.green.400}' } },
      okBg: { value: { base: '{colors.green.100}', _dark: 'rgba(138, 210, 155, 0.16)' } },
      warn: { value: '{colors.yellow.300}' },
      danger: { value: { base: '{colors.red.500}', _dark: '#ff9f9f' } },
    },
    brand: {
      sky: { value: '{colors.sky.200}' },
      periwinkle: { value: '{colors.periwinkle.300}' },
      lavender: { value: '{colors.lavender.300}' },
    },
  },
  gradients: {
    brand: { value: 'linear-gradient(100deg, #7cc0f4 0%, #8fa6f6 45%, #b893f6 100%)' },
    brandSoft: {
      value: 'linear-gradient(135deg, {colors.sky.200}, {colors.periwinkle.300} 50%, {colors.lavender.300})',
    },
  },
  shadows: {
    card: { value: { base: '0 8px 24px rgba(27, 42, 68, 0.08)', _dark: '0 8px 24px rgba(0, 0, 0, 0.35)' } },
    float: { value: { base: '0 30px 70px rgba(27, 42, 68, 0.18)', _dark: '0 30px 70px rgba(0, 0, 0, 0.55)' } },
    button: { value: { base: '0 8px 20px rgba(27, 42, 68, 0.22)', _dark: '0 8px 20px rgba(154, 178, 248, 0.25)' } },
  },
});

export const textStyles = defineTextStyles({
  display: {
    value: {
      fontFamily: 'heading',
      fontWeight: '900',
      fontSize: 'clamp(44px, 5.8vw, 82px)',
      lineHeight: '1.04',
      letterSpacing: '-0.025em',
    },
  },
  h2: {
    value: {
      fontFamily: 'body',
      fontWeight: '800',
      fontSize: 'clamp(28px, 3.4vw, 42px)',
      lineHeight: '1.35',
      letterSpacing: '-0.01em',
    },
  },
  h3: { value: { fontWeight: '800', fontSize: '17px', lineHeight: '1.5' } },
  lead: { value: { fontSize: 'clamp(15px, 1.3vw, 17px)', lineHeight: '1.9' } },
  body: { value: { fontSize: '14px', lineHeight: '1.8' } },
  small: { value: { fontSize: '13px', lineHeight: '1.7' } },
  eyebrow: {
    value: {
      fontFamily: 'heading',
      fontWeight: '800',
      fontSize: '13px',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
    },
  },
  mono: { value: { fontFamily: 'mono', fontSize: '12.5px', lineHeight: '1.75' } },
});

export const keyframes = defineKeyframes({
  dash: { to: { strokeDashoffset: '-22' } },
  float: { '0%, 100%': { translate: '0 0' }, '50%': { translate: '0 -3.5%' } },
});
