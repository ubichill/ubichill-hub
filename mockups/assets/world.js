// ubichill のワールドを再現した「動くミニワールド」（モック用・依存なし）
// みんなのカーソルが動き回り、ペンで描き、動画の前に集まる様子を HTML/SVG で再現する。
// 訪問者のマウスもカーソルとして参加でき、ドラッグで線を描ける。
//
// 使い方:
//   <div data-world style="height:520px"></div>
//   <script type="module" src="./assets/world.js"></script>
//
// data 属性（任意）:
//   data-theme="light"   light(既定 #F0F8FF) | cream | dark | transparent
//   data-cursors="5"     NPC カーソル数 (0〜7)
//   data-video="1"       動画プレイヤーを置く
//   data-notes="1"       付箋を置く
//   data-tray="1"        ペントレイを置く
//   data-hud="1"         下部の HUD バーを置く
//   data-you="1"         訪問者カーソル（あなた）を出す・ドラッグで描ける
//   data-frame="1"       ブラウザ風の枠（URL バー）を付ける
//   data-grid="dots"     dots | lines | none

const THEMES = {
  light: { bg: '#F0F8FF', grid: 'rgba(27,42,68,.10)', ink: '#1b2a44', panel: '#ffffff', panelInk: '#1b2a44', line: 'rgba(27,42,68,.12)' },
  cream: { bg: '#faf6f0', grid: 'rgba(112,98,79,.16)', ink: '#1b2a44', panel: '#fffdf9', panelInk: '#1b2a44', line: 'rgba(112,98,79,.22)' },
  dark: { bg: '#121a2b', grid: 'rgba(255,255,255,.07)', ink: '#e8ecf6', panel: '#1c2740', panelInk: '#e8ecf6', line: 'rgba(255,255,255,.10)' },
  transparent: { bg: 'transparent', grid: 'rgba(27,42,68,.08)', ink: '#1b2a44', panel: '#ffffff', panelInk: '#1b2a44', line: 'rgba(27,42,68,.12)' },
};

const PEOPLE = [
  { name: 'ありす', color: '#9ab2f8' },
  { name: 'ようかん', color: '#ceb0fa' },
  { name: 'haku', color: '#7cc7e8' },
  { name: 'mio', color: '#f4a7c1' },
  { name: 'ねこ', color: '#8ad29b' },
  { name: 'taro', color: '#f1c86c' },
  { name: 'rin', color: '#4780e0' },
];

const NOTES = [
  { text: '22時から\n映画会するよ', color: '#fff3b8', x: 69, y: 58, r: 4 },
  { text: '今日のタスク\n・スライド\n・レビュー', color: '#dff0ff', x: 6, y: 52, r: -5 },
  { text: 'mod つくった\nurl 貼るだけ', color: '#f3e6ff', x: 47, y: 70, r: 2 },
];

const ICONS = {
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  sound: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  play: '<polygon points="7 4 20 12 7 20 7 4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};

const svgIcon = (name, size = 16, stroke = 'currentColor') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const cursorSvg = (color) =>
  `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5 19.5 11l-6.6 1.9L9.6 19.6z" fill="${color}" stroke="#1b2a44" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STYLE = `
:where(.uw){position:relative}
.uw{overflow:hidden;font-family:"Inter","Noto Sans JP",system-ui,sans-serif;isolation:isolate;touch-action:pan-y pinch-zoom}
.uw__canvas{position:absolute;inset:0}
.uw__ink{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
.uw__ink path{fill:none;stroke-linecap:round;stroke-linejoin:round;transition:opacity 1.2s ease}
.uw__cursor{position:absolute;left:0;top:0;z-index:10;pointer-events:none;will-change:transform}
.uw__cursor svg{display:block;filter:drop-shadow(0 2px 3px rgba(27,42,68,.25))}
.uw__tag{position:absolute;left:16px;top:18px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.5;white-space:nowrap;color:#1b2a44;box-shadow:0 2px 6px rgba(27,42,68,.15)}
.uw__chat{position:absolute;left:18px;top:-18px;padding:3px 9px;border-radius:10px 10px 10px 2px;background:#fff;color:#1b2a44;font-size:11px;white-space:nowrap;box-shadow:0 4px 12px rgba(27,42,68,.16);opacity:0;transform:translateY(4px);transition:all .3s}
.uw__chat.is-on{opacity:1;transform:none}
.uw__video{position:absolute;left:24%;top:12%;width:42%;aspect-ratio:16/10.5;border-radius:12px;overflow:hidden;z-index:1;box-shadow:0 10px 30px rgba(27,42,68,.18);background:#14141a;display:flex;flex-direction:column}
.uw__screen{flex:1;position:relative;background:linear-gradient(135deg,#2a3a66 0%,#6b5aa8 45%,#f0a6c4 100%);overflow:hidden}
.uw__screen::before{content:"";position:absolute;inset:auto -10% -30% -10%;height:70%;background:radial-gradient(60% 60% at 30% 70%,rgba(255,215,160,.65),transparent 70%),radial-gradient(40% 50% at 80% 80%,rgba(160,200,255,.5),transparent 70%)}
.uw__screen::after{content:"";position:absolute;left:12%;right:12%;bottom:12%;height:18%;border-radius:6px 6px 0 0;background:linear-gradient(#0f1424,#1d2440);clip-path:polygon(0 100%,0 40%,8% 40%,8% 10%,18% 10%,18% 55%,30% 55%,30% 25%,38% 25%,38% 60%,52% 60%,52% 0,60% 0,60% 50%,72% 50%,72% 30%,84% 30%,84% 65%,100% 65%,100% 100%)}
.uw__badge{white-space:nowrap;position:absolute;left:10px;top:10px;z-index:2;display:flex;gap:6px;align-items:center;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.45);color:#fff;font-size:10px;font-weight:700;letter-spacing:.04em}
.uw__badge i{width:6px;height:6px;border-radius:50%;background:#ff6b6b;display:block}
.uw__ctrl{height:34px;display:flex;align-items:center;gap:10px;padding:0 12px;color:rgba(255,255,255,.85);font-size:10px}
.uw__bar{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.18);position:relative;overflow:hidden}
.uw__bar b{position:absolute;inset:0 auto 0 0;width:38%;background:#4780e0;border-radius:2px;animation:uw-progress 40s linear infinite}
@keyframes uw-progress{from{width:12%}to{width:96%}}
.uw__play{width:22px;height:22px;border-radius:50%;background:#4780e0;display:grid;place-items:center;color:#fff}
.uw__note{position:absolute;z-index:1;width:15%;min-width:96px;padding:10px 12px;font-size:11px;line-height:1.55;white-space:pre-line;color:#3d3426;box-shadow:0 6px 16px rgba(27,42,68,.12);border-radius:3px}
.uw__tray{position:absolute;left:12px;top:12px;z-index:3;display:flex;gap:6px;padding:6px;border-radius:12px;box-shadow:0 4px 14px rgba(27,42,68,.12)}
.uw__pen{width:30px;height:30px;border-radius:8px;display:grid;place-items:center}
.uw__pen.is-active{outline:2px solid #4780e0;outline-offset:1px}
.uw__hud{position:absolute;left:50%;width:max-content;bottom:12px;transform:translateX(-50%);z-index:12;display:flex;gap:2px;padding:5px;border-radius:14px;background:#1b2a44;box-shadow:0 8px 24px rgba(15,23,41,.3)}
.uw__hudbtn{white-space:nowrap;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 10px;border-radius:9px;color:rgba(255,255,255,.82);font-size:9.5px;position:relative}
.uw__hudbtn.is-on{background:rgba(255,255,255,.12)}
.uw__hudbtn em{position:absolute;top:2px;right:8px;min-width:14px;height:14px;border-radius:7px;background:#c0392b;color:#fff;font-style:normal;font-size:9px;display:grid;place-items:center;font-weight:700}
.uw--compact .uw__hudbtn{font-size:0;gap:0;padding:8px 10px}
.uw--compact .uw__hudbtn em{font-size:9px}
.uw--compact .uw__people{font-size:0;gap:0;padding:5px 6px}
.uw__frame{position:absolute;left:0;right:0;top:0;height:38px;z-index:20;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid}
.uw__dots{display:flex;gap:6px}.uw__dots i{width:10px;height:10px;border-radius:50%;display:block}
.uw__url{flex:1;max-width:420px;margin:0 auto;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11.5px;font-weight:600;letter-spacing:.01em}
.uw__ping{position:absolute;z-index:9;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;border:2px solid;pointer-events:none;animation:uw-ping .7s ease-out forwards}
@keyframes uw-ping{from{transform:scale(.2);opacity:1}to{transform:scale(1.6);opacity:0}}
.uw__people{position:absolute;right:12px;top:12px;z-index:12;display:flex;align-items:center;gap:8px;padding:5px 10px 5px 6px;border-radius:999px;font-size:11px;font-weight:700;box-shadow:0 4px 14px rgba(27,42,68,.12)}
.uw__avatars{display:flex}.uw__avatars i{width:20px;height:20px;border-radius:50%;border:2px solid;margin-left:-6px;display:block}.uw__avatars i:first-child{margin-left:0}
`;

function injectStyle() {
  if (document.getElementById('uw-style')) return;
  const s = document.createElement('style');
  s.id = 'uw-style';
  s.textContent = STYLE;
  document.head.appendChild(s);
}

const flag = (el, key, def) => (el.dataset[key] === undefined ? def : el.dataset[key] !== '0');
const rand = (a, b) => a + Math.random() * (b - a);

function build(el) {
  injectStyle();
  const theme = THEMES[el.dataset.theme] || THEMES.light;
  const n = Math.min(7, Number(el.dataset.cursors ?? 5));
  const showVideo = flag(el, 'video', true);
  const showNotes = flag(el, 'notes', true);
  const showTray = flag(el, 'tray', true);
  const showHud = flag(el, 'hud', true);
  const showYou = flag(el, 'you', true);
  const showFrame = flag(el, 'frame', false);
  const grid = el.dataset.grid || 'dots';

  el.classList.add('uw');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', 'Ubichill のワールドでみんなのカーソルが集まって過ごしている様子');

  const canvas = document.createElement('div');
  canvas.className = 'uw__canvas';
  canvas.style.background = theme.bg;
  if (grid === 'dots') {
    canvas.style.backgroundImage = `radial-gradient(${theme.grid} 1.2px, transparent 1.3px)`;
    canvas.style.backgroundSize = '22px 22px';
  } else if (grid === 'lines') {
    canvas.style.backgroundImage = `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`;
    canvas.style.backgroundSize = '32px 32px';
  }
  if (showFrame) canvas.style.top = '38px';
  el.appendChild(canvas);

  if (showFrame) {
    const f = document.createElement('div');
    f.className = 'uw__frame';
    f.style.background = theme.panel;
    f.style.borderColor = theme.line;
    f.innerHTML = `<div class="uw__dots"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div><div class="uw__url" style="background:${theme.line};color:${theme.panelInk}">${svgIcon('lock', 11)}ubichill.com/@yokan/chill-room</div><div style="width:46px"></div>`;
    el.appendChild(f);
  }

  if (showVideo) {
    const v = document.createElement('div');
    v.className = 'uw__video';
    v.innerHTML = `<div class="uw__screen"><span class="uw__badge"><i></i>LIVE · みんなで視聴中</span></div><div class="uw__ctrl"><span class="uw__play">${svgIcon('play', 10, '#fff')}</span><span class="uw__bar"><b></b></span><span>lofi beats to chill</span></div>`;
    canvas.appendChild(v);
  }
  if (showNotes) {
    for (const note of NOTES) {
      const d = document.createElement('div');
      d.className = 'uw__note';
      d.textContent = note.text;
      d.style.cssText += `left:${note.x}%;top:${note.y}%;background:${note.color};transform:rotate(${note.r}deg)`;
      canvas.appendChild(d);
    }
  }
  let activePenColor = '#93bcf0';
  if (showTray) {
    const t = document.createElement('div');
    t.className = 'uw__tray';
    t.style.background = theme.panel;
    const pens = [
      { c: '#93bcf0', label: 'ペン（青）' },
      { c: '#1a1a1a', label: 'ペン（黒）' },
      { c: '#f4a7c1', label: 'ペン（ピンク）' },
    ];
    t.innerHTML = pens
      .map(
        (p, i) =>
          `<span class="uw__pen${i === 0 ? ' is-active' : ''}" data-c="${p.c}" title="${p.label}" style="background:${theme.bg}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${p.c === '#1a1a1a' && theme === THEMES.dark ? '#e8ecf6' : p.c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span>`,
      )
      .join('');
    if (showFrame) t.style.top = '50px';
    el.appendChild(t);
    t.style.pointerEvents = 'auto';
    t.addEventListener('pointerdown', (e) => {
      const pen = e.target.closest('.uw__pen');
      if (!pen) return;
      e.stopPropagation();
      for (const p of t.querySelectorAll('.uw__pen')) p.classList.toggle('is-active', p === pen);
      activePenColor = pen.dataset.c;
    });
  }

  const people = document.createElement('div');
  people.className = 'uw__people';
  people.style.background = theme.panel;
  people.style.color = theme.panelInk;
  people.innerHTML = `<span class="uw__avatars">${PEOPLE.slice(0, Math.max(3, n))
    .map((p) => `<i style="background:${p.color};border-color:${theme.panel}"></i>`)
    .join('')}</span>${n + (showYou ? 1 : 0)} 人がここにいます`;
  if (showFrame) people.style.top = '50px';
  el.appendChild(people);

  if (showHud) {
    const h = document.createElement('div');
    h.className = 'uw__hud';
    const items = [
      ['rocket', 'ランチパッド'],
      ['bell', '通知', 2],
      ['pin', '現在地'],
      ['sound', '音声', 0, true],
      ['gear', '設定'],
    ];
    h.innerHTML = items
      .map(
        ([ic, label, badge, on]) =>
          `<span class="uw__hudbtn${on ? ' is-on' : ''}">${svgIcon(ic, 15)}${label}${badge ? `<em>${badge}</em>` : ''}</span>`,
      )
      .join('');
    el.appendChild(h);
  }

  const ink = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  ink.setAttribute('class', 'uw__ink');
  el.appendChild(ink);

  // 初期の落書き（ワールドに既に描かれている線）
  const seedStroke = (d, color, w) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', w);
    ink.appendChild(p);
  };

  const size = () => {
    const r = el.getBoundingClientRect();
    ink.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    return r;
  };
  let rect = size();
  const compact = () => el.classList.toggle('uw--compact', rect.width < 480);
  compact();
  new ResizeObserver(() => {
    rect = size();
    compact();
  }).observe(el);

  {
    // URL バーの分だけ下げる（seed の線は el 座標で描く）
    const top = showFrame ? 38 : 0;
    const W = rect.width;
    const H = rect.height - top;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(0 ${top})`);
    ink.appendChild(g);
    const seedInto = (d, color, w) => {
      seedStroke(d, color, w);
      g.appendChild(ink.lastChild);
    };
    seedInto(
      `M ${W * 0.74} ${H * 0.2} q ${W * 0.03} ${-H * 0.06} ${W * 0.06} 0 t ${W * 0.06} 0 t ${W * 0.06} 0`,
      '#93bcf0',
      4,
    );
    seedInto(
      `M ${W * 0.78} ${H * 0.33} c ${W * 0.02} ${-H * 0.05} ${W * 0.07} ${-H * 0.05} ${W * 0.08} 0 c ${W * 0.01} ${H * 0.05} ${-W * 0.06} ${H * 0.08} ${-W * 0.08} 0`,
      '#ceb0fa',
      4,
    );
    seedInto(`M ${W * 0.08} ${H * 0.36} l ${W * 0.04} ${H * 0.03} l ${W * 0.07} ${-H * 0.08}`, '#8ad29b', 5);
  }

  const makeStroke = (color, w = 4) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', w);
    ink.appendChild(p);
    const pts = [];
    return {
      add(x, y) {
        pts.push([x, y]);
        p.setAttribute('d', pts.map(([a, b], i) => `${i ? 'L' : 'M'} ${a.toFixed(1)} ${b.toFixed(1)}`).join(' '));
      },
      fade(after = 4000) {
        setTimeout(() => {
          p.style.opacity = '0';
          setTimeout(() => p.remove(), 1300);
        }, after);
      },
    };
  };

  // NPC カーソル
  const spots = [
    { x: 0.3, y: 0.3, kind: 'video' },
    { x: 0.55, y: 0.36, kind: 'video' },
    { x: 0.44, y: 0.52, kind: 'video' },
    { x: 0.12, y: 0.62, kind: 'note' },
    { x: 0.75, y: 0.66, kind: 'note' },
    { x: 0.8, y: 0.24, kind: 'draw' },
    { x: 0.16, y: 0.3, kind: 'draw' },
    { x: 0.62, y: 0.78, kind: 'draw' },
  ];
  const lines = ['いいね', 'この曲すき', 'おつかれ〜', 'ここ描いていい？', 'あとで映画みよ', '作業もどる', 'それな'];

  const npcs = PEOPLE.slice(0, n).map((person, i) => {
    const c = document.createElement('div');
    c.className = 'uw__cursor';
    c.innerHTML = `${cursorSvg(person.color)}<span class="uw__tag" style="background:${person.color}">${person.name}</span><span class="uw__chat"></span>`;
    el.appendChild(c);
    const start = spots[i % spots.length];
    return {
      el: c,
      chat: c.querySelector('.uw__chat'),
      color: person.color,
      x: start.x * rect.width + rand(-40, 40),
      y: start.y * rect.height + rand(-30, 30),
      tx: 0,
      ty: 0,
      mode: 'idle',
      until: performance.now() + rand(300, 2500),
      stroke: null,
      phase: rand(0, Math.PI * 2),
    };
  });

  const chooseNext = (npc, now) => {
    const s = spots[Math.floor(Math.random() * spots.length)];
    npc.tx = s.x * rect.width + rand(-50, 50);
    npc.ty = s.y * rect.height + rand(-30, 30);
    npc.mode = 'move';
    npc.kind = s.kind;
    npc.until = now + rand(1800, 3200);
  };

  const say = (npc) => {
    npc.chat.textContent = lines[Math.floor(Math.random() * lines.length)];
    npc.chat.classList.add('is-on');
    setTimeout(() => npc.chat.classList.remove('is-on'), 2200);
  };

  // 訪問者
  let you = null;
  if (showYou) {
    const c = document.createElement('div');
    c.className = 'uw__cursor';
    c.style.opacity = '0';
    c.innerHTML = `<span class="uw__tag" style="left:14px;top:16px;background:#1b2a44;color:#fff">あなた</span>`;
    el.appendChild(c);
    you = { el: c, drawing: null };
    el.style.cursor = 'crosshair';
    const local = (e) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    el.addEventListener('pointerenter', () => {
      c.style.opacity = '1';
    });
    el.addEventListener('pointerleave', () => {
      c.style.opacity = '0';
      if (you.drawing) {
        you.drawing.fade(2500);
        you.drawing = null;
      }
    });
    el.addEventListener('pointermove', (e) => {
      const [x, y] = local(e);
      c.style.transform = `translate(${x}px, ${y}px)`;
      if (you.drawing) you.drawing.add(x, y);
    });
    el.addEventListener('pointerdown', (e) => {
      const [x, y] = local(e);
      el.setPointerCapture?.(e.pointerId);
      you.drawing = makeStroke(activePenColor, 4);
      you.drawing.add(x, y);
      const ping = document.createElement('span');
      ping.className = 'uw__ping';
      ping.style.left = `${x}px`;
      ping.style.top = `${y}px`;
      ping.style.borderColor = activePenColor;
      el.appendChild(ping);
      setTimeout(() => ping.remove(), 800);
    });
    const end = () => {
      if (you.drawing) {
        you.drawing.fade(5000);
        you.drawing = null;
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  const render = (npc) => {
    npc.el.style.transform = `translate(${npc.x.toFixed(1)}px, ${npc.y.toFixed(1)}px)`;
  };
  for (const npc of npcs) render(npc);
  if (reduceMotion) return;

  // 画面外では止める
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(el);

  const tick = (now) => {
    if (visible) {
      for (const npc of npcs) {
        if (npc.mode === 'idle') {
          // その場で小さく揺れる（作業中・視聴中）
          npc.x += Math.sin(now / 700 + npc.phase) * 0.15;
          npc.y += Math.cos(now / 900 + npc.phase) * 0.12;
          if (now > npc.until) chooseNext(npc, now);
        } else if (npc.mode === 'move') {
          npc.x += (npc.tx - npc.x) * 0.045;
          npc.y += (npc.ty - npc.y) * 0.045;
          if (Math.hypot(npc.tx - npc.x, npc.ty - npc.y) < 3) {
            if (npc.kind === 'draw' && Math.random() < 0.85) {
              npc.mode = 'draw';
              npc.stroke = makeStroke(npc.color, 4);
              npc.drawT = 0;
              npc.drawCx = npc.x;
              npc.drawCy = npc.y;
              npc.drawShape = Math.floor(Math.random() * 3);
              npc.until = now + rand(1600, 2600);
            } else {
              npc.mode = 'idle';
              npc.until = now + rand(1500, 4500);
              if (Math.random() < 0.45) say(npc);
            }
          }
        } else if (npc.mode === 'draw') {
          npc.drawT += 0.05;
          const t = npc.drawT;
          const R = Math.min(rect.width, rect.height) * 0.06;
          if (npc.drawShape === 0) {
            // 波線
            npc.x = npc.drawCx + t * 14;
            npc.y = npc.drawCy + Math.sin(t * 2.2) * R * 0.5;
          } else if (npc.drawShape === 1) {
            // ぐるぐる
            npc.x = npc.drawCx + Math.cos(t * 1.6) * R * (0.4 + t * 0.06);
            npc.y = npc.drawCy + Math.sin(t * 1.6) * R * (0.4 + t * 0.06);
          } else {
            // ハート
            const a = t * 0.9;
            npc.x = npc.drawCx + R * 0.055 * 16 * Math.sin(a) ** 3;
            npc.y = npc.drawCy - R * 0.055 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
          }
          npc.stroke.add(npc.x, npc.y);
          if (now > npc.until || (npc.drawShape === 2 && t > 7)) {
            npc.stroke.fade(3500);
            npc.stroke = null;
            npc.mode = 'idle';
            npc.until = now + rand(800, 2000);
          }
        }
        render(npc);
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function init() {
  for (const el of document.querySelectorAll('[data-world]')) {
    if (el.dataset.worldReady) continue;
    el.dataset.worldReady = '1';
    build(el);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

export { init };
