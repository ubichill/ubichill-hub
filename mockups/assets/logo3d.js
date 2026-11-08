// 3D ロゴ（モック用・依存なし）
// ロゴを色ごとのレイヤー（blue / peri / lav）に分け、各レイヤーを薄い板の積層で押し出して
// CSS 3D で立体に見せる。ポインタ追従で傾き、待機中はゆっくり浮遊する。
//
// 使い方:
//   <div data-logo3d style="width:360px;aspect-ratio:667/761"></div>
//   <script type="module" src="./assets/logo3d.js"></script>
//
// data 属性（任意）:
//   data-depth="28"      レイヤー間の奥行き(px, 要素幅 360px 基準でスケール)
//   data-thickness="10"  各レイヤーの押し出しの厚み(px)
//   data-tilt="22"       ポインタ追従の最大傾き(deg)
//   data-spin="0"        1 にするとゆっくり Y 軸回転し続ける
//   data-gloss="1"       0 で表面のハイライトを消す
//   data-shadow="1"      0 で足元の影を消す
//   data-mode="layered"  "flat" にするとレイヤー分けせず単一画像を押し出す
//   data-shade="0.38"    押し出し側面の暗さ(0〜1)。暗い背景では小さめにする
//   data-backing="#fff"  パーツ間のすき間を埋める下地の色（元ロゴの白いすき間を再現）。"none" で透過

const BASE = new URL('.', import.meta.url).href;
const LAYERS = [
  { key: 'blue', z: 0 },
  { key: 'peri', z: 1 },
  { key: 'lav', z: 2 },
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STYLE = `
:where(.l3d){position:relative}
.l3d{perspective:1400px;user-select:none;-webkit-user-select:none}
.l3d__stage{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform;transition:transform .18s ease-out}
.l3d__layer{position:absolute;inset:0;transform-style:preserve-3d}
.l3d__slice{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;backface-visibility:visible;pointer-events:none}
.l3d__gloss{position:absolute;inset:0;pointer-events:none;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;mix-blend-mode:screen;backface-visibility:hidden}
.l3d__backing{position:absolute;inset:0;pointer-events:none;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center}
.l3d__shadow{position:absolute;left:18%;right:18%;bottom:-7%;height:9%;border-radius:50%;background:radial-gradient(closest-side,rgba(27,42,68,.26),transparent);filter:blur(5px);pointer-events:none}
@keyframes l3d-shadow{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.88);opacity:.75}}
.l3d--float .l3d__shadow{animation:l3d-shadow 6s ease-in-out infinite}
@keyframes l3d-float{0%,100%{translate:0 0}50%{translate:0 -3.5%}}
.l3d--float .l3d__bob{animation:l3d-float 6s ease-in-out infinite}
.l3d__bob{position:absolute;inset:0;transform-style:preserve-3d}
`;

function injectStyle() {
  if (document.getElementById('l3d-style')) return;
  const s = document.createElement('style');
  s.id = 'l3d-style';
  s.textContent = STYLE;
  document.head.appendChild(s);
}

function makeSlice(src, z, shade, dark) {
  const img = document.createElement('img');
  img.className = 'l3d__slice';
  img.src = src;
  img.alt = '';
  img.decoding = 'async';
  img.style.transform = `translateZ(${z}px)`;
  if (shade > 0) {
    // 側面：奥ほど暗く
    img.style.filter = `brightness(${1 - shade * dark}) saturate(${1 + shade * 0.25})`;
  }
  return img;
}

function build(el) {
  injectStyle();
  const mode = el.dataset.mode || 'layered';
  const scale = (el.clientWidth || 360) / 360;
  const depth = Number(el.dataset.depth ?? 26) * scale;
  const thickness = Number(el.dataset.thickness ?? 10) * scale;
  const tilt = Number(el.dataset.tilt ?? 22);
  const spin = el.dataset.spin === '1';
  const gloss = el.dataset.gloss !== '0';
  const shadow = el.dataset.shadow !== '0';
  const dark = Number(el.dataset.shade ?? 0.38);
  const backing = el.dataset.backing ?? '#ffffff';
  const steps = Math.max(4, Math.round(thickness / 1.2));

  el.classList.add('l3d');
  if (!reduceMotion) el.classList.add('l3d--float');
  el.setAttribute('role', 'img');
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Ubichill ロゴ');

  const stage = document.createElement('div');
  stage.className = 'l3d__stage';
  const bob = document.createElement('div');
  bob.className = 'l3d__bob';
  stage.appendChild(bob);

  const layers = mode === 'flat' ? [{ key: 'flat', z: 0 }] : LAYERS;
  const center = ((layers.length - 1) * depth) / 2;

  if (backing !== 'none' && backing !== '0' && mode !== 'flat') {
    // 中央のレイヤーの裏に、すき間を埋めたシルエットを置く（奥に置くと傾けたときのズレが大きい）
    const bk = document.createElement('div');
    bk.className = 'l3d__backing';
    bk.style.background = backing;
    bk.style.webkitMaskImage = `url(${BASE}logo-silhouette.png)`;
    bk.style.maskImage = `url(${BASE}logo-silhouette.png)`;
    bk.style.transform = `translateZ(${-thickness - 0.5}px)`;
    bob.appendChild(bk);
  }

  for (const { key, z } of layers) {
    const src = key === 'flat' ? `${BASE}logo-transparent.png` : `${BASE}logo-layer-${key}.png`;
    const layer = document.createElement('div');
    layer.className = 'l3d__layer';
    const front = z * depth - center;
    for (let i = steps; i >= 0; i -= 1) {
      layer.appendChild(makeSlice(src, front - (i / steps) * thickness, i / steps, dark));
    }
    if (gloss) {
      const g = document.createElement('div');
      g.className = 'l3d__gloss';
      g.style.transform = `translateZ(${front + 0.5}px)`;
      g.style.webkitMaskImage = `url(${src})`;
      g.style.maskImage = `url(${src})`;
      g.style.background =
        'radial-gradient(120% 60% at 30% 12%, rgba(255,255,255,.75), rgba(255,255,255,0) 55%), linear-gradient(160deg, rgba(255,255,255,.35), rgba(255,255,255,0) 40%)';
      layer.appendChild(g);
    }
    bob.appendChild(layer);
  }
  if (shadow) {
    const sh = document.createElement('div');
    sh.className = 'l3d__shadow';
    // 回転するステージの外（2D）に置く。中に置くとパースで左右にずれる
    el.appendChild(sh);
  }
  el.appendChild(stage);

  // 動き
  const base = { x: -8, y: 16 };
  const state = { tx: base.x, ty: base.y, x: base.x, y: base.y, spin: 0 };
  const apply = () => {
    stage.style.transform = `rotateX(${state.x}deg) rotateY(${state.y + state.spin}deg)`;
  };
  apply();
  if (reduceMotion) return;

  const host = el.closest('[data-logo3d-host]') || window;
  host.addEventListener(
    'pointermove',
    (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
      state.ty = base.y + nx * tilt;
      state.tx = base.x - ny * tilt * 0.7;
    },
    { passive: true },
  );
  host.addEventListener?.('pointerleave', () => {
    state.tx = base.x;
    state.ty = base.y;
  });

  stage.style.transition = 'none';
  const tick = (t) => {
    state.x += (state.tx - state.x) * 0.08;
    state.y += (state.ty - state.y) * 0.08;
    state.spin = spin ? (t / 60) % 360 : Math.sin(t / 2600) * 6;
    apply();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function init() {
  for (const el of document.querySelectorAll('[data-logo3d]')) {
    if (el.dataset.logo3dReady) continue;
    el.dataset.logo3dReady = '1';
    build(el);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

export { init };
