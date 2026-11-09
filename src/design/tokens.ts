/**
 * デザイントークン（PandaCSS）
 *
 * 3 層で持つ。
 * - tokens        : 生の値（色のパレット・フォント・角丸・影）。コンポーネントから直接使わない
 * - semanticTokens: 役割（bg / fg / accent / border …）。明暗はここで切り替える（`_dark`）
 * - textStyles    : 見出し・リードなどの文字組み
 *
 * 雰囲気は「夕暮れの部屋でだらっと過ごす」。
 * 明るいテーマは cream の紙に、空の色（sky → periwinkle → lavender → peach）の薄い光。
 * 暗いテーマは本体のワールド背景（#141d33）と同じ夜の部屋に、ランプの暖かい光。
 * 影は輪郭を出さず、ぼんやりと落とす。角丸は大きく、直線を減らす。
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
    // 夕焼け・ランプの暖色。ロゴ色の冷たさを和らげる
    peach: {
      100: { value: '#fdeee4' },
      200: { value: '#f9d8c4' },
      300: { value: '#f4b89a' },
      500: { value: '#e58f68' },
    },
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
      // 本体のワールド（夜の部屋）の背景色
      925: { value: '#141d33' },
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
    sm: { value: '12px' },
    md: { value: '20px' },
    lg: { value: '28px' },
    xl: { value: '44px' },
    full: { value: '999px' },
  },
  sizes: {
    container: { value: '1160px' },
    wide: { value: '1400px' },
  },
  durations: {
    fast: { value: '150ms' },
    normal: { value: '260ms' },
    slow: { value: '600ms' },
  },
});

export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      DEFAULT: { value: { base: '{colors.cream.100}', _dark: '{colors.navy.975}' } },
      surface: { value: { base: '{colors.white}', _dark: '{colors.navy.850}' } },
      subtle: { value: { base: '{colors.cream.200}', _dark: '{colors.navy.800}' } },
      // 夜の部屋（mod の帯、画面の枠）。本体のワールド背景と同じ色
      inverse: { value: { base: '{colors.navy.925}', _dark: '{colors.navy.1000}' } },
      // 画面を入れる暗い窓の枠
      frame: { value: { base: '{colors.navy.950}', _dark: '#0b1322' } },
      // 3D ロゴの下地（夕暮れの面の中間色。層のすき間を埋める）
      hero: { value: { base: '#ebe8f6', _dark: '#1c2140' } },
      code: { value: { base: '{colors.navy.950}', _dark: '#070c18' } },
      glass: { value: { base: 'rgba(255, 255, 255, 0.72)', _dark: 'rgba(24, 34, 56, 0.72)' } },
      header: { value: { base: 'rgba(250, 246, 240, 0.78)', _dark: 'rgba(15, 23, 41, 0.78)' } },
    },
    fg: {
      DEFAULT: { value: { base: '{colors.navy.900}', _dark: '{colors.navy.100}' } },
      muted: { value: { base: '{colors.navy.500}', _dark: '{colors.navy.200}' } },
      subtle: { value: { base: '{colors.navy.300}', _dark: '{colors.navy.400}' } },
      // 暗い帯の上の文字（明暗どちらでも明るい）
      inverse: { value: '{colors.navy.50}' },
      inverseMuted: { value: 'rgba(248, 243, 234, 0.72)' },
    },
    accent: {
      DEFAULT: { value: { base: '{colors.navy.900}', _dark: '{colors.periwinkle.300}' } },
      hover: { value: { base: '{colors.navy.700}', _dark: '{colors.periwinkle.400}' } },
      fg: { value: { base: '{colors.navy.50}', _dark: '{colors.navy.975}' } },
    },
    highlight: { value: { base: '{colors.blue.500}', _dark: '{colors.periwinkle.300}' } },
    link: { value: { base: '{colors.periwinkle.700}', _dark: '{colors.periwinkle.400}' } },
    // 暖色のアクセント（ランプ・夕焼け）。面と光に使い、文字には使わない
    warm: { value: { base: '{colors.peach.300}', _dark: '{colors.peach.300}' } },
    border: {
      DEFAULT: { value: { base: 'rgba(27, 42, 68, 0.08)', _dark: 'rgba(255, 255, 255, 0.09)' } },
      strong: { value: { base: 'rgba(27, 42, 68, 0.16)', _dark: 'rgba(255, 255, 255, 0.16)' } },
    },
    // アイコンの下地など、ロゴ色の淡い面
    tint: {
      sky: { value: { base: '{colors.sky.100}', _dark: 'rgba(189, 225, 251, 0.14)' } },
      periwinkle: { value: { base: '{colors.periwinkle.100}', _dark: 'rgba(154, 178, 248, 0.16)' } },
      lavender: { value: { base: '{colors.lavender.100}', _dark: 'rgba(206, 176, 250, 0.16)' } },
      peach: { value: { base: '{colors.peach.100}', _dark: 'rgba(244, 184, 154, 0.16)' } },
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
      peach: { value: '{colors.peach.300}' },
    },
  },
  gradients: {
    // 文字用（ロゴ色を少し濃くしてコントラストを確保）
    brand: { value: 'linear-gradient(100deg, #7cc0f4 0%, #8fa6f6 45%, #b893f6 100%)' },
    brandSoft: {
      value: 'linear-gradient(135deg, {colors.sky.200}, {colors.periwinkle.300} 50%, {colors.lavender.300})',
    },
    // 夕暮れの空。ヒーローと締めの面に敷く
    dusk: {
      value: {
        base: 'linear-gradient(170deg, #e6f0fc 0%, #e9e6fa 42%, #f6e5e8 74%, #fbeadb 100%)',
        _dark: 'linear-gradient(170deg, #121b33 0%, #1a1e3f 45%, #2a2142 78%, #342538 100%)',
      },
    },
    // 夜の部屋にランプの光
    lamp: {
      value: {
        base: 'radial-gradient(ellipse at 80% 0%, rgba(244, 184, 154, 0.35), transparent 55%)',
        _dark: 'radial-gradient(ellipse at 80% 0%, rgba(244, 184, 154, 0.22), transparent 55%)',
      },
    },
  },
  shadows: {
    // 輪郭を出さず、ぼんやり落とす
    card: {
      value: { base: '0 14px 40px -18px rgba(27, 42, 68, 0.22)', _dark: '0 14px 40px -18px rgba(0, 0, 0, 0.6)' },
    },
    float: {
      value: { base: '0 40px 90px -30px rgba(27, 42, 68, 0.35)', _dark: '0 40px 90px -30px rgba(0, 0, 0, 0.75)' },
    },
    button: {
      value: { base: '0 10px 24px -10px rgba(27, 42, 68, 0.45)', _dark: '0 10px 24px -10px rgba(154, 178, 248, 0.45)' },
    },
    // 暗い窓の枠の中の画面
    screen: { value: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)' },
  },
});

export const textStyles = defineTextStyles({
  display: {
    value: {
      fontFamily: 'body',
      fontWeight: '800',
      fontSize: 'clamp(38px, 5vw, 68px)',
      lineHeight: '1.22',
      letterSpacing: '-0.015em',
    },
  },
  h2: {
    value: {
      fontFamily: 'body',
      fontWeight: '800',
      fontSize: 'clamp(26px, 3vw, 38px)',
      lineHeight: '1.4',
      letterSpacing: '-0.01em',
    },
  },
  h3: { value: { fontWeight: '800', fontSize: '17px', lineHeight: '1.5' } },
  lead: { value: { fontSize: 'clamp(15px, 1.3vw, 17px)', lineHeight: '2' } },
  body: { value: { fontSize: '14px', lineHeight: '1.9' } },
  small: { value: { fontSize: '13px', lineHeight: '1.8' } },
  // 小さな見出しの札。大文字・字間の広い英字はやめて、やわらかい日本語の札にする
  eyebrow: {
    value: {
      fontFamily: 'body',
      fontWeight: '700',
      fontSize: '13px',
      letterSpacing: '0.04em',
    },
  },
  mono: { value: { fontFamily: 'mono', fontSize: '12.5px', lineHeight: '1.75' } },
});

export const keyframes = defineKeyframes({
  dash: { to: { strokeDashoffset: '-22' } },
  float: { '0%, 100%': { translate: '0 0' }, '50%': { translate: '0 -3.5%' } },
  // 空の色がゆっくり流れる
  drift: {
    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
    '33%': { transform: 'translate(3%, -4%) scale(1.06)' },
    '66%': { transform: 'translate(-2%, 3%) scale(0.97)' },
  },
  // 星またたき・ランプのゆらぎ
  breathe: { '0%, 100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
});
