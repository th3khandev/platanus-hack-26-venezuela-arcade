// CHAPITA BRAVA - beisbol de chapita callejero. Platanus Hack 26, Caracas.
// Todo procedural: Phaser 3.87 + Graphics + Web Audio. Sin assets externos.
// Audio con ZzFX micro de Frank Force (licencia MIT).
(() => {
const W = 800, H = 600;
const M = Math, sin = M.sin, cos = M.cos, abs = M.abs, rnd = M.random, hyp = M.hypot, PI = M.PI, max = M.max, min = M.min;
const clamp = (v, a, b) => max(a, min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const now = () => performance.now();

// ================= INPUT (codigos de cabina) =================
// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
const CABINET_KEYS = {
  P1_U: ['w'],
  P1_D: ['s'],
  P1_L: ['a'],
  P1_R: ['d'],
  P1_1: ['u'],
  P1_2: ['i'],
  P1_3: ['o'],
  P1_4: ['j'],
  P1_5: ['k'],
  P1_6: ['l'],
  P2_U: ['ArrowUp'],
  P2_D: ['ArrowDown'],
  P2_L: ['ArrowLeft'],
  P2_R: ['ArrowRight'],
  P2_1: ['r'],
  P2_2: ['t'],
  P2_3: ['y'],
  P2_4: ['f'],
  P2_5: ['g'],
  P2_6: ['h'],
  START1: ['Enter'],
  START2: ['2'],
};
const K2A = {};
for (const c in CABINET_KEYS) for (const k of CABINET_KEYS[c]) K2A[k.length == 1 ? k.toLowerCase() : k] = c;
// held = mantenido, tap = pulsado en este frame, stamp = performance.now() del keydown.
// Idempotente: los controles virtuales mandan el mismo keydown a document y a window.
const held = {}, tap = {}, stamp = {};
let lastIn = 0;
const kc = (e) => e.key && K2A[e.key.length == 1 ? e.key.toLowerCase() : e.key];
addEventListener('keydown', (e) => {
  unlock();
  const c = kc(e);
  if (c && !held[c]) { held[c] = 1; tap[c] = 1; lastIn = stamp[c] = now(); }
});
addEventListener('keyup', (e) => { const c = kc(e); if (c) held[c] = 0; });
addEventListener('blur', () => { for (const c in held) held[c] = 0; });
// algun boton de accion (1..6) del prefijo P1_ / P2_
const anyBtn = (p) => { for (let i = 1; i < 7; i++) if (tap[p + i]) return p + i; return 0; };
const clearTaps = () => { for (const c in tap) tap[c] = 0; };

// ================= AUDIO =================
let AC = null, OUT = null;
function unlock() { if (AC && AC.state != 'running') AC.resume().catch(() => 0); }
addEventListener('pointerdown', unlock, true);
addEventListener('touchstart', unlock, true);
// ZzFX micro (Frank Force, MIT)
const zzfx = (p = 1, k = .05, b = 220, e = 0, r = 0, t = .1, q = 0, D = 1, u = 0, y = 0, v = 0, z = 0, l = 0, E = 0, A = 0, F = 0, c = 0, w = 1, m = 0, B = 0, N = 0) => {
  if (!AC || AC.state != 'running') return;
  let d = 2 * PI, R = 44100, G = u *= 500 * d / R / R, C = b *= (1 - k + 2 * k * rnd(k = [])) * d / R, g = 0, Hh = 0, a = 0, n = 1, I = 0, J = 0, f = 0, h = N < 0 ? -1 : 1, x = d * h * N * 2 / R, L = cos(x), Z = sin, Kk = Z(x) / 4, O = 1 + Kk, X = -2 * L / O, Y = (1 - Kk) / O, P = (1 + h * L) / 2 / O, Q = -(h + L) / O, S = P, T = 0, U = 0, V = 0, Ww = 0;
  e = R * e + 9; m *= R; r *= R; t *= R; c *= R; y *= 500 * d / R ** 3; A *= d / R; v *= d / R; z *= R; l = R * l | 0; p *= .3;
  for (h = e + m + r + t + c | 0; a < h; k[a++] = f * p) ++J % (100 * F | 0) || (f = q ? 1 < q ? 2 < q ? 3 < q ? 4 < q ? (g / d % 1 < D / 2) * 2 - 1 : Z(g ** 3) : max(min(M.tan(g), 1), -1) : 1 - (2 * g / d % 2 + 2) % 2 : 1 - 4 * abs(M.round(g / d) - g / d) : Z(g), f = (l ? 1 - B + B * Z(d * a / l) : 1) * (4 < q ? f : (f < 0 ? -1 : 1) * abs(f) ** D) * (a < e ? a / e : a < e + m ? 1 - (a - e) / m * (1 - w) : a < e + m + r ? w : a < h - c ? (h - a - c) / t * w : 0), f = c ? f / 2 + (c > a ? 0 : (a < h - c ? 1 : (h - a) / c) * k[a - c | 0] / 2 / p) : f, N ? f = Ww = S * T + Q * (T = U) + P * (U = f) - Y * V - X * (V = Ww) : 0), x = (b += u += y) * cos(A * Hh++), g += x + x * E * (a * a * d % 2 - 1), n && ++n > z && (b += v, C += v, n = 0), !l || ++I % l || (b = C, u = G, n = n || 1);
  const buf = AC.createBuffer(1, h, R); buf.getChannelData(0).set(k); const s = AC.createBufferSource(); s.buffer = buf; s.connect(OUT); s.start();
};
const SFX = {
  toc: [1.6, , 600, , .01, .05, 4, 1.4, , , , , , .6, , .15],
  clk: [.9, , 2400, , .01, .06, 1, 2, , , , , , , , , .03],
  box: [1.4, , 110, , .02, .1, 4, .4, , , , , , , , .2],
  glass: [1.3, .2, 1900, , .06, .5, 4, 1.6, , , , , , .9, , .25, .08],
  scream: [1, .05, 820, .06, .35, .4, 2, 1.4, 6, , , , , .3, 8],
  swoosh: [.7, , 320, .06, , .14, 4, , -12],
  ui: [.5, , 900, , , .05, 1],
  ui2: [.6, , 600, , .05, .1, 1, , , , 300, .05],
  strike: [.9, , 300, .02, .12, .25, 2, 2, , , , , , .3],
  uuh: [.6, .1, 200, .15, .4, .5, 2, .5, 2, , , , , .2, 4],
  beep: [.5, , 1300, , .1, .05, 1, , , , , , .12],
};
const sfx = (k) => { try { zzfx(...SFX[k]); } catch (e) { } };
function initAudio(sc) {
  AC = sc.sound.context || null;
  if (!AC) return;
  OUT = AC.createGain(); OUT.gain.value = .9; OUT.connect(AC.destination);
}
function tone(f, t, d, type, g) {
  if (!AC || AC.state != 'running') return;
  const o = AC.createOscillator(), a = AC.createGain(), t0 = AC.currentTime + t;
  o.type = type; o.frequency.setValueAtTime(f, t0); a.gain.setValueAtTime(g, t0); a.gain.exponentialRampToValueAtTime(.001, t0 + d);
  o.connect(a).connect(OUT); o.start(t0); o.stop(t0 + d);
}

// ================= FUENTE BITMAP 3x5 con contorno =================
// '^' se dibuja como el signo de apertura invertido.
const GLYPHS = "0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ!?-:./'^+";
const GDATA = [31599, 11415, 29671, 29391, 23497, 31183, 31215, 29330, 31727, 31695, 0, 11245, 27566, 14627, 27502, 31143, 31140, 14699, 23533, 29847, 4714, 23469, 18727, 24557, 27501, 11114, 27556, 11123, 27565, 14478, 29842, 23407, 23402, 23549, 23213, 23186, 29351, 9346, 25218, 448, 1040, 2, 4772, 9216, 8338, 1488];
function buildFont(sc) {
  const S = 2, cw = 5 * S, ch = 7 * S, t = sc.textures.createCanvas('fnt', GLYPHS.length * cw, ch), x = t.getContext();
  [...GLYPHS].forEach((_, i) => {
    const g = GDATA[i];
    for (const pass of [0, 1]) for (let b = 0; b < 15; b++) if (g >> (14 - b) & 1) {
      const px = i * cw + (1 + b % 3) * S, py = (1 + (b / 3 | 0)) * S;
      if (pass) { x.fillStyle = '#fff'; x.fillRect(px, py, S, S); }
      else { x.fillStyle = '#111'; x.fillRect(px - S, py, S * 3, S); x.fillRect(px, py - S, S, S * 3); }
    }
  });
  t.refresh(); t.setFilter(Phaser.Textures.FilterMode.NEAREST);
  sc.cache.bitmapFont.add('fnt', Phaser.GameObjects.RetroFont.Parse(sc, { image: 'fnt', width: cw, height: ch, chars: GLYPHS, charsPerRow: GLYPHS.length }));
}
// texto con contorno: k = escala (alto = 14*k px), col = tinte, ox = origen x
const txt = (sc, x, y, s, k, col, ox) => sc.add.bitmapText(x, y, 'fnt', s).setScale(k || 2).setOrigin(ox == null ? .5 : ox, .5).setTint(col || 0xffffff).setDepth(60);

// ================= STORAGE (top 5) =================
// Solo platanusArcadeStorage. Si no existe, falla o tarda >3 s: memoria de la sesion (nunca storage directo del navegador).
const SKEY = 'chapita-brava:top5:v1';
let memTop = null;
const DEF_TOP = [['CHA', 420], ['PIT', 300], ['BRA', 220], ['VAA', 140], ['JON', 80]].map((a) => ({ n: a[0], s: a[1] }));
const okTop = (v) => Array.isArray(v) && v.length <= 5 && v.every((e) => e && typeof e.n == 'string' && /^[A-Z]{3}$/.test(e.n) && Number.isInteger(e.s) && e.s >= 0);
function loadTop() {
  const st = window.platanusArcadeStorage;
  if (memTop) return Promise.resolve(memTop);
  if (!st) return Promise.resolve(memTop = DEF_TOP.slice());
  return Promise.race([st.get(SKEY), new Promise((r) => setTimeout(() => r(null), 3000))])
    .then((r) => (memTop = r && r.found && okTop(r.value) ? r.value : DEF_TOP.slice()))
    .catch(() => (memTop = DEF_TOP.slice()));
}
function saveTop(list) {
  memTop = list.slice(0, 5);
  const st = window.platanusArcadeStorage;
  if (st) try { st.set(SKEY, memTop).catch(() => 0); } catch (e) { }
}
const qualifies = (s) => s > 0 && (!memTop || memTop.length < 5 || s > memTop[memTop.length - 1].s);

// ================= MUNDO 3D (pies) =================
// y recorre la calle: pared con el cuadro en y=-6, home en y=0, pitcher en y=30, casa del fondo en y=FY.
const FY = 170, SW = 18, CURB = 12, ROOF = 24;
const WIN = { x0: -6, x1: 6, z0: 9, z1: 16 }; // ventana de la vecina en la casa del fondo
const SQ = { x0: -1.1, x1: 1.1, z0: 1.3, z1: 3.5 }; // cuadro de strike pintado en la pared
const CAR = { x0: 8, x1: 14.5, y0: 70, y1: 84 };
const POSTE = { x: -15, y: 112 };
const BAT_X = 2.4, CATCH_X = -2.9;
// camaras: d = direccion (+1 mira calle abajo, -1 mira a la pared), p = inclinacion, f = focal
const CAMW = { x: 0, y: 33, z: 5.4, d: -1, p: .06, f: 800, cx: 400, cy: 300 };
const camS = () => ({ x: 0, y: -16, z: 9.5, d: 1, p: .05, f: 620, cx: 400, cy: 320 });
function cam3(c, x, y, z) {
  const X = (x - c.x) * c.d, Y = (y - c.y) * c.d, Z = z - c.z, cp = cos(c.p), sp = sin(c.p);
  return [X, Y * cp - Z * sp, Y * sp + Z * cp];
}
const scr = (c, q) => { const s = c.f / q[1]; return [c.cx + q[0] * s, c.cy - q[2] * s, s]; };
const proj = (c, x, y, z) => { const q = cam3(c, x, y, z || 0); return q[1] < .5 ? null : scr(c, q); };
// poligono 3D con recorte en el plano cercano
function poly(g, c, pts, col, a) {
  const q = pts.map((p) => cam3(c, p[0], p[1], p[2] || 0)), o = [];
  for (let i = 0; i < q.length; i++) {
    const A = q[i], B = q[(i + 1) % q.length], ia = A[1] >= .5, ib = B[1] >= .5;
    if (ia) o.push(A);
    if (ia != ib) { const t = (.5 - A[1]) / (B[1] - A[1]); o.push([lerp(A[0], B[0], t), .5, lerp(A[2], B[2], t)]); }
  }
  if (o.length < 3) return;
  g.fillStyle(col, a == null ? 1 : a).beginPath();
  o.forEach((p, i) => { const s = scr(c, p); i ? g.lineTo(s[0], s[1]) : g.moveTo(s[0], s[1]); });
  g.closePath().fillPath();
}
// rectangulo en un plano: x fijo (fachada lateral), y fijo (frente) o z fijo (suelo)
const rx = (x, y0, y1, z0, z1) => [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]];
const ry = (y, x0, x1, z0, z1) => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
const rz = (z, x0, x1, y0, y1) => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
function line3(g, c, a, b, w, col, al) {
  let A = cam3(c, a[0], a[1], a[2]), B = cam3(c, b[0], b[1], b[2]);
  if (A[1] < .5 && B[1] < .5) return;
  if (A[1] < .5 || B[1] < .5) { const t = (.5 - A[1]) / (B[1] - A[1]), P = [lerp(A[0], B[0], t), .5, lerp(A[2], B[2], t)]; if (A[1] < .5) A = P; else B = P; }
  const p = scr(c, A), q = scr(c, B);
  g.lineStyle(w, col, al == null ? 1 : al).lineBetween(p[0], p[1], q[0], q[1]);
}

// Casas laterales (generadas una vez con semilla fija para que la calle siempre sea la misma)
let seed = 11;
const sr = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const HCOL = [0xff8fb8, 0x6fd17f, 0x7fd1f7, 0xffd166, 0xc3a6ff, 0xff9f5a, 0xf4efe1, 0x9be3c8];
const shade = (c, k) => ((((c >> 16) & 255) * k) << 16) | ((((c >> 8) & 255) * k) << 8) | ((c & 255) * k);
const HOUSES = [];
for (const sd of [-1, 1]) {
  let y = -6;
  while (y < FY) {
    const len = min(FY - y, 16 + (sr() * 14 | 0)), h = sr() < .55 ? 19 + sr() * 4 : 10 + sr() * 2;
    HOUSES.push({ sd, y0: y, y1: y + len, h, col: HCOL[(sr() * HCOL.length) | 0], door: sr() < .6, win: sr() });
    y += len;
  }
}
HOUSES.forEach((o, i) => { const p = HOUSES[i - 1], n = HOUSES[i + 1]; o.ph = p && p.sd == o.sd ? p.h : 0; o.nh = n && n.sd == o.sd ? n.h : 0; });
// chapitas regadas por el suelo
const LITTER = [];
for (let i = 0; i < 18; i++) LITTER.push([(sr() - .5) * 2 * (sr() < .5 ? 6 : 15), -5 + sr() * (sr() < .6 ? 14 : 120), [0xe63946, 0x1d4ed8, 0xffd60a, 0x2a9d8f, 0xffffff][i % 5]]);

function drawHouse(g, c, o) {
  const x = o.sd * SW, xi = x - o.sd * .06, d = c.d;
  poly(g, c, rx(x, o.y0, o.y1, 0, o.h), o.col);
  poly(g, c, rx(xi, o.y0, o.y1, 0, 1.8), shade(o.col, .78));
  poly(g, c, rx(xi, o.y0, o.y1, o.h - .9, o.h), shade(o.col, .85));
  // cara lateral visible donde la casa sobresale de la vecina
  if (d > 0 && o.h > o.ph) poly(g, c, ry(o.y0, x, x + o.sd * 10, o.ph, o.h), shade(o.col, .7));
  if (d < 0 && o.h > o.nh) poly(g, c, ry(o.y1, x, x + o.sd * 10, o.nh, o.h), shade(o.col, .7));
  // puerta y ventanas con reja
  const L = o.y1 - o.y0;
  let yy = o.y0 + 3;
  if (o.door) { poly(g, c, rx(xi, yy, yy + 3.2, 0, 7), 0x6b4226); yy += 5.5; }
  for (const fl of o.h > 15 ? [3, 12.5] : [3]) {
    for (let w = yy; w + 4 < o.y1 - 1.5; w += 7) {
      poly(g, c, rx(xi, w, w + 4, fl + .2, fl + 4.2), 0x2b3a4a);
      for (let b = 1; b < 4; b++) line3(g, c, [xi, w + b, fl + .2], [xi, w + b, fl + 4.2], 1.5, 0xe8e8e8);
    }
    if (L < 6) break;
  }
}
function drawWorld(g, c, sc) {
  const d = c.d;
  // cielo y montana
  g.fillGradientStyle(0x63b8ff, 0x63b8ff, 0xcdeeff, 0xcdeeff, 1).fillRect(0, 0, W, H);
  if (d > 0) {
    poly(g, c, [[-900, 900, 0], [-500, 900, 260], [-200, 900, 380], [120, 900, 300], [420, 900, 420], [900, 900, 220], [900, 900, 0]], 0x4f9d5d);
    poly(g, c, [[-700, 700, 0], [-300, 700, 150], [60, 700, 210], [380, 700, 120], [700, 700, 0]], 0x3b8049);
    // casa del fondo con la ventana de la vecina
    poly(g, c, ry(FY, -60, 60, 0, ROOF), 0x8fd3e8);
    poly(g, c, ry(FY - .1, -60, 60, ROOF - .6, ROOF + 1.6), 0xb5523b);
    poly(g, c, ry(FY - .1, -60, 60, 0, 2), 0x6aa9bf);
    poly(g, c, ry(FY - .2, WIN.x0 - .6, WIN.x1 + .6, WIN.z0 - .6, WIN.z1 + .6), 0xf4efe1);
    poly(g, c, ry(FY - .3, WIN.x0, WIN.x1, WIN.z0, WIN.z1), sc && sc.broke ? 0x1b2633 : 0x9fd8f0);
    poly(g, c, ry(FY - .2, -10, -6.5, 0, 7), 0x6b4226);
    poly(g, c, ry(FY - .2, 7, 11, 3, 7), 0x2b3a4a);
  } else {
    // detras de la pared: arbol y techo de una casa
    poly(g, c, ry(-30, -40, 10, 0, 17), 0xf2c6a0);
    poly(g, c, ry(-29.9, -40, 10, 16, 18), 0xb5523b);
    g.fillStyle(0x3f8f4a);
    for (const t of [[12, -26, 19, 7], [20, -24, 22, 6], [6, -25, 22, 5]]) { const p = proj(c, t[0], t[1], t[2]); if (p) g.fillCircle(p[0], p[1], t[3] * p[2]); }
    // pared encalada con manchas y el cuadro pintado
    poly(g, c, ry(-6, -SW, SW, 0, 11), 0xf1eee6);
    poly(g, c, ry(-5.95, -SW, SW, 0, 1.2), 0xd7d2c4);
    const T = .16, sq = (a, b, e, f) => poly(g, c, ry(-5.9, a, b, e, f), 0xd62828);
    sq(SQ.x0 - T, SQ.x1 + T, SQ.z1, SQ.z1 + T); sq(SQ.x0 - T, SQ.x1 + T, SQ.z0 - T, SQ.z0);
    sq(SQ.x0 - T, SQ.x0, SQ.z0, SQ.z1); sq(SQ.x1, SQ.x1 + T, SQ.z0, SQ.z1);
  }
  // suelo: calle, brocal amarillo y aceras
  poly(g, c, rz(0, -CURB, CURB, -6, FY), 0x8b8f96);
  for (const p of [[-5, 14, -2, 17], [3, 60, 6, 66], [-7, 120, -3, 128]]) poly(g, c, rz(.01, p[0], p[2], p[1], p[3]), 0x868a91);
  for (const sd of [-1, 1]) {
    poly(g, c, rz(.02, sd * CURB, sd * (CURB + .7), -6, FY), 0xf2c230);
    poly(g, c, rz(.01, sd * (CURB + .7), sd * SW, -6, FY), 0xcfc8b8);
  }
  // home de piedra
  poly(g, c, [[-.9, -.6, .03], [.8, -.7, .03], [1, .5, .03], [-.2, .9, .03], [-1, .4, .03]], 0xd9d6cf);
  for (const l of LITTER) { const p = proj(c, l[0], l[1], .05); if (p) g.fillStyle(l[2]).fillEllipse(p[0], p[1], max(2, .28 * p[2]), max(1, .1 * p[2])); }
  // fachadas laterales de lejos a cerca
  const hs = HOUSES.slice().sort((a, b) => ((b.y0 + b.y1) - (a.y0 + a.y1)) * d);
  for (const o of hs) drawHouse(g, c, o);
  // poste, cables y carro (solo existen calle abajo)
  if (d > 0) {
    poly(g, c, ry(POSTE.y, POSTE.x - .4, POSTE.x + .4, 0, 27), 0x9a9a9a);
    poly(g, c, ry(POSTE.y - .05, POSTE.x - 3, POSTE.x + 3, 24.5, 25.2), 0x7a7a7a);
    const cab = (a, b, sag) => { let p = a; for (let i = 1; i <= 8; i++) { const t = i / 8, q = [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t) - sag * 4 * t * (1 - t)]; line3(g, c, p, q, 1.6, 0x222222); p = q; } };
    cab([POSTE.x - 2.5, POSTE.y, 25], [SW, POSTE.y - 20, 18], 2.5);
    cab([POSTE.x + 2.5, POSTE.y, 25], [SW, POSTE.y + 25, 20], 2);
    cab([POSTE.x, POSTE.y, 25], [-SW, -6, 20], 3);
    cab([POSTE.x - 1, POSTE.y, 24.8], [-SW, FY, 21], 3);
    cab([POSTE.x + 1, POSTE.y, 25], [SW - 2, -6, 19], 4);
    // carro estacionado
    const C = CAR, rc = 0xd62839;
    poly(g, c, rx(C.x0, C.y0, C.y1, .9, 3.2), rc);
    poly(g, c, ry(C.y0, C.x0, C.x1, .9, 3.2), shade(rc, .8));
    poly(g, c, rz(3.2, C.x0, C.x1, C.y0, C.y1), rc);
    poly(g, c, rx(C.x0 + .9, C.y0 + 3, C.y1 - 2.5, 3.2, 4.9), 0x24323f);
    poly(g, c, ry(C.y0 + 3, C.x0 + .9, C.x1 - .6, 3.2, 4.9), 0x2e4050);
    poly(g, c, rz(4.9, C.x0 + .9, C.x1 - .6, C.y0 + 3, C.y1 - 2.5), shade(rc, .9));
    poly(g, c, ry(C.y0 - .05, C.x0 + .3, C.x0 + 1.3, 2, 2.6), 0xffb703);
    poly(g, c, ry(C.y0 - .05, C.x1 - 1.3, C.x1 - .3, 2, 2.6), 0xffb703);
    for (const wy of [C.y0 + 2.5, C.y1 - 2.5]) poly(g, c, rx(C.x0 - .05, wy - 1.2, wy + 1.2, 0, 1.6), 0x1b1b1b);
  } else {
    // cables por encima de la pared
    line3(g, c, [-SW, 30, 21], [SW, -6, 18], 1.6, 0x222222);
    line3(g, c, [-SW, -6, 19], [SW, 20, 22], 1.6, 0x222222);
  }
}

// <PHYS>
// ================= FISICA (pies, segundos) =================
const G = 32.17, MPH = 1.4667, DRAG = .0032, LIFT = .22;
const R0 = { x: -1.1, y: 27.5, z: 4.6 }; // punto de suelta (dedos del pitcher)
const KIDS0 = [[-6, 52], [6, 104]];
// altura de las casas laterales en (lado, y)
const houseH = (sd, y) => { for (const o of HOUSES) if (o.sd == sd && y >= o.y0 && y < o.y1) return o.h; return 12; };
// lanzamiento n (0 = primero del turno). tipo: 0 recta, 1 bailarina, 2 caida
function makePitch(n, out) {
  const easy = n < 3, r = rnd(), ty = easy ? 0 : r < .4 ? 0 : r < .75 ? 1 : 2;
  const T = easy ? .95 : clamp(.8 - (n - 3) * .013, .56, .8) * (ty ? 1 : .9);
  let xa = easy ? (rnd() - .5) * .8 : (rnd() - .5) * 1.7, za = easy ? 2.3 + (rnd() - .5) * .6 : 1.6 + rnd() * 1.7;
  if (out) { if (rnd() < .5) xa = (rnd() < .5 ? -1 : 1) * (1.8 + rnd() * .6); else za = rnd() < .5 ? .7 : 4.3; }
  const side = rnd() < .5 ? -1 : 1, A = ty == 1 ? side * (.9 + rnd() * .5) : 0, D = ty == 2 ? 1.5 + rnd() * .6 : 0;
  return { ty, T, xa, za, A, D, side, xb: xa - A };
}
// posicion de la chapita en el parametro u (0 = mano, 1 = home, >1 hacia la pared)
function pitchPos(p, u) {
  const bail = p.ty == 1 ? p.A * (u < 1 ? sin(5 * PI * u) * .5 * (1 - u) + u : 1) : 0;
  const drop = p.ty == 2 ? p.D * max(0, (u - .55) / .45) ** 2 : 0;
  return [lerp(R0.x, p.xb, u) + bail, lerp(R0.y, 0, u), max(.15, lerp(R0.z, p.za + p.D, u) + 2.4 * u * (1 - u) - drop)];
}
const inSquare = (x, z) => abs(x) <= SQ.x1 + .2 && z >= SQ.z0 - .2 && z <= SQ.z1 + .2;
// batazo: simula a dt fijo y devuelve la trayectoria + el resultado
function simHit(ev, la, sp, zb) {
  const a = la * PI / 180, s = sp * PI / 180, h = ev * cos(a), dt = 1 / 120;
  const b = { x: .3, y: .5, z: zb, vx: h * sin(s), vy: h * cos(s), vz: ev * sin(a) };
  const path = [], ev2 = [];
  let k = null, broke = 0, t = 0, land = null, top = 0, catchI = -1, kid = -1, end = 0;
  for (let i = 0; i < 900 && !end; i++) {
    const v = hyp(b.vx, b.vy, b.vz), px = b.x, py = b.y, pz = b.z;
    b.vx -= DRAG * v * b.vx * dt; b.vy -= DRAG * v * b.vy * dt;
    b.vz += (-G + (b.vz > 0 && !land ? LIFT * G : 0) - DRAG * v * b.vz) * dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; t += dt; top = max(top, b.z);
    if (!k) {
      if (b.y < -5.5) { k = 'FOUL'; b.y = -5.5; b.vy *= -.3; }
      else if (b.y >= FY && py < FY) {
        const f = (FY - py) / (b.y - py), cx = lerp(px, b.x, f), cz = lerp(pz, b.z, f);
        if (cz > ROOF + 1.6) k = 'JONRON';
        else if (cx > WIN.x0 && cx < WIN.x1 && cz > WIN.z0 && cz < WIN.z1) { k = 'JONRON'; broke = 1; end = 1; b.x = cx; b.y = FY; b.z = cz; }
        else { k = cz > 8 ? 'TRIPLE' : 'DOBLE'; b.y = FY - .1; b.vy *= -.35; ev2.push(['wall', path.length]); }
      } else if (abs(b.x) >= SW) {
        const sd = b.x > 0 ? 1 : -1;
        if (b.z > houseH(sd, b.y) + 3) k = 'JONRON';
        else { if (b.y < 14) k = 'FOUL'; b.x = sd * (SW - .05); b.vx *= -.45; b.vy *= .8; ev2.push(['side', path.length]); }
      } else if (b.x > CAR.x0 && b.x < CAR.x1 && b.y > CAR.y0 && b.y < CAR.y1 && b.z < 4.9) {
        k = 'DOBLE'; b.vy *= -.3; b.vz = abs(b.vz) * .3 + 4; b.y = CAR.y0 - .05; ev2.push(['car', path.length]);
      } else if (hyp(b.x - POSTE.x, b.y - POSTE.y) < 1 && b.z < 27) {
        k = 'TRIPLE'; b.vy *= -.4; b.vx *= -.4; ev2.push(['poste', path.length]);
      }
    }
    if (b.z <= 0) {
      b.z = 0;
      if (!land) { land = { x: b.x, y: b.y, t, i: path.length }; ev2.push(['land', path.length]); }
      b.vz = -b.vz * .35; b.vx *= .7; b.vy *= .7;
      if (abs(b.vz) < 2) b.vz = 0;
    }
    if (i % 2 == 0) path.push([b.x, b.y, b.z]);
    if (land && hyp(b.vx, b.vy) < 4 && !b.vz) end = 1;
    if (k == 'JONRON' && (b.y > FY + 60 || abs(b.x) > SW + 30)) end = 1;
  }
  // atrapadas de los ninos (solo si nada decidio antes)
  if (!k && land && land.y > 8) {
    for (let j = 0; j < 2 && catchI < 0; j++) {
      const kx = KIDS0[j][0], ky = KIDS0[j][1];
      if (top > 6) { if (hyp(land.x - kx, land.y - ky) <= 13 * max(0, land.t - .35)) { catchI = land.i; kid = j; } }
      else for (let i = 0; i < path.length; i++) {
        const q = path[i], tt = i / 60;
        if (q[1] < 110 && hyp(q[0] - kx, q[1] - ky) <= 1.5 + 11 * max(0, tt - .4)) { catchI = i; kid = j; break; }
      }
    }
    if (catchI >= 0) { k = 'OUT'; path.length = catchI + 1; }
  }
  if (!k) k = !land || land.y < 8 ? 'FOUL' : land.y < 60 ? 'SENCILLO' : land.y < 120 ? 'DOBLE' : 'TRIPLE';
  let ft;
  if (k == 'JONRON') { const c = { ...b }; for (let i = 0; i < 900 && c.z > 0; i++) { const v = hyp(c.vx, c.vy, c.vz); c.vx -= DRAG * v * c.vx * dt; c.vy -= DRAG * v * c.vy * dt; c.vz += (-G - DRAG * v * c.vz) * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; } ft = hyp(c.x, c.y) | 0; }
  else { const e = land || b; ft = hyp(e.x, e.y) | 0; }
  return { path, k, broke, ft, ev: ev2, kid, land };
}
// </PHYS>

// ================= PERSONAJES (procedurales, de frente) =================
// (x,y) = pies en pantalla, s = px por pie. o: sh camisa, pa short, sk piel, ha pelo, cap gorra,
// br = angulo de la escoba (null = sin escoba), hx/hy = manos relativas (pies), cr = agachado 0..1,
// run = fase de carrera, back = de espaldas, box = caja de carton, arms = [angI, angD] sin manos juntas
function dude(g, x, y, s, o) {
  const cr = o.cr || 0, legH = 2.1 * s * (1 - .5 * cr), hipY = y - legH, torH = 1.6 * s, shY = hipY - torH, hr = .45 * s;
  const run = o.run != null ? sin(o.run) * .4 * s : 0, spread = (.28 + cr * .45) * s;
  // piernas y zapatos
  for (const k of [-1, 1]) {
    const lx = x + k * spread + (k > 0 ? run : -run) * .5;
    g.fillStyle(o.sk).fillRect(lx - .16 * s, hipY, .32 * s, legH);
    g.fillStyle(0x222222).fillRect(lx - .22 * s, y - .25 * s, .44 * s, .25 * s);
  }
  g.fillStyle(o.pa).fillRect(x - .62 * s - cr * .3 * s, hipY - .1 * s, 1.24 * s + cr * .6 * s, .85 * s);
  // torso
  g.fillStyle(o.sh).fillRect(x - .6 * s, shY, 1.2 * s, torH + .1 * s);
  if (o.num) g.fillStyle(0xffffff, .9).fillRect(x - .2 * s, shY + .4 * s, .4 * s, .5 * s);
  // brazos y manos
  const shL = [x - .55 * s, shY + .2 * s], shR = [x + .55 * s, shY + .2 * s];
  let hands;
  if (o.hx != null) hands = [[x + o.hx * s, y - o.hy * s], [x + o.hx * s + .15 * s, y - o.hy * s + .1 * s]];
  else { const a = o.arms || [1.9, 1.25]; hands = [[shL[0] + cos(a[0]) * 1.4 * s, shL[1] + sin(a[0]) * 1.4 * s], [shR[0] + cos(a[1]) * 1.4 * s, shR[1] + sin(a[1]) * 1.4 * s]]; }
  g.lineStyle(.3 * s, o.sk);
  g.lineBetween(shL[0], shL[1], hands[0][0], hands[0][1]);
  g.lineBetween(shR[0], shR[1], hands[1][0], hands[1][1]);
  g.fillStyle(o.sh).fillCircle(shL[0], shL[1] + .05 * s, .22 * s).fillCircle(shR[0], shR[1] + .05 * s, .22 * s);
  // escoba
  if (o.br != null) {
    const hx = hands[0][0], hy = hands[0][1], L = 4.6 * s;
    g.lineStyle(max(2, .16 * s), 0xd9b26f).lineBetween(hx - cos(o.br) * .5 * s, hy - sin(o.br) * .5 * s, hx + cos(o.br) * L, hy + sin(o.br) * L);
  }
  g.fillStyle(o.sk).fillCircle(hands[0][0], hands[0][1], .17 * s).fillCircle(hands[1][0], hands[1][1], .17 * s);
  // caja de carton del receptor
  if (o.box) {
    const bx = x - .9 * s, by = shY + .1 * s + (o.box > 1 ? -.2 * s : 0);
    g.fillStyle(0xc48a52).fillRect(bx, by, 1.8 * s, 1.3 * s);
    g.fillStyle(0x8a5a2b).fillRect(bx, by, 1.8 * s, .18 * s).fillRect(bx + .85 * s, by + .2 * s, .1 * s, 1.1 * s);
  }
  // cabeza
  const hy = shY - hr * .85;
  g.fillStyle(o.sk).fillCircle(x, hy, hr);
  g.fillStyle(o.ha).fillEllipse(x, hy - hr * (o.back ? .1 : .45), hr * 2.05, hr * (o.back ? 2 : 1.15));
  if (o.cap != null) { g.fillStyle(o.cap).fillEllipse(x, hy - hr * .55, hr * 2.1, hr * 1.1); if (!o.back) g.fillRect(x - hr * 1.1, hy - hr * .35, hr * 2.2, hr * .28); }
  if (!o.back) {
    g.fillStyle(0x1b1b1b).fillRect(x - hr * .45, hy - hr * .05, hr * .22, hr * .3).fillRect(x + hr * .25, hy - hr * .05, hr * .22, hr * .3);
    if (o.mouth) g.fillStyle(0x7a0010).fillEllipse(x, hy + hr * .5, hr * .55, hr * .5);
  }
  return hands[0];
}
// vecina con rolos en la ventana (sc = escala px/pie en la ventana, grita = brazos arriba y boca abierta)
function vecina(g, x, y, s, grita) {
  const hr = .9 * s;
  g.fillStyle(0xff6fa8).fillRect(x - 1.5 * s, y - .6 * s, 3 * s, 2 * s);
  g.lineStyle(.45 * s, 0xc68642);
  if (grita) { g.lineBetween(x - 1.3 * s, y - .3 * s, x - 2.4 * s, y - 2.4 * s); g.lineBetween(x + 1.3 * s, y - .3 * s, x + 2.4 * s, y - 2.4 * s); }
  g.fillStyle(0xc68642).fillCircle(x, y - 1.6 * s, hr);
  g.fillStyle(0x3b2414).fillEllipse(x, y - 2.2 * s, hr * 2.2, hr * 1.2);
  g.fillStyle(0xff8fab);
  for (let i = -2; i <= 2; i++) g.fillCircle(x + i * .45 * s, y - 2.5 * s + abs(i) * .15 * s, .28 * s);
  g.fillStyle(0x1b1b1b).fillRect(x - .45 * s, y - 1.75 * s, .25 * s, .3 * s).fillRect(x + .2 * s, y - 1.75 * s, .25 * s, .3 * s);
  g.fillStyle(0x7a0010).fillEllipse(x, y - 1.05 * s, grita ? .7 * s : .4 * s, grita ? .6 * s : .15 * s);
}
// mano del pitcher en primer plano (en coordenadas locales; el objeto Graphics se rota y se mueve)
function drawHand(g, open) {
  g.clear();
  g.fillStyle(0x9a6b45).fillRect(10, 30, 70, 160);
  g.fillStyle(0x2a9d8f).fillRect(4, 120, 82, 80);
  g.fillStyle(0xc68642).fillEllipse(40, 20, 84, 74);
  g.fillStyle(0xb57a3c);
  if (open) { for (let i = 0; i < 4; i++) g.fillRect(-2 + i * 22, -48 - (i == 1 || i == 2 ? 10 : 0), 16, 52); g.fillRect(-34, 0, 40, 16); }
  else { for (let i = 0; i < 4; i++) g.fillRect(4 + i * 18, -14, 16, 26); g.fillRect(-16, -2, 30, 16); }
}

// ================= ESCENA =================
const SKIN = [0xc68642, 0x8d5524, 0xe0ac69, 0x6b3e1f];
const RCOL = { FOUL: 0xffffff, OUT: 0xff5d5d, SENCILLO: 0x9cff57, DOBLE: 0x57d3ff, TRIPLE: 0xffb000, JONRON: 0xffd60a };
const PCOL = [0xffd60a, 0x57d3ff];
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LAG = 0; // ms de latencia de la cabina (se suma al stamp del swing)
const DEMO = [117.5, 18.5, 0]; // batazo del modo demo: entra por la ventana
const ease = (k) => 1 - (1 - k) ** 3;
// chapita: tapa roja con centro amarillo; spin la pone de canto
function chapita(g, x, y, d, spin, a) {
  const w = d * (.28 + .72 * abs(cos(spin)));
  g.fillStyle(0x111111, a).fillEllipse(x, y, w + 4, d + 4);
  g.fillStyle(0xd62828, a).fillEllipse(x, y, w, d);
  g.fillStyle(0xffd60a, a).fillEllipse(x, y, w * .5, d * .5);
}
function moto() {
  if (!AC || AC.state != 'running') return;
  const o = AC.createOscillator(), f = AC.createBiquadFilter(), a = AC.createGain(), t = AC.currentTime;
  o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(95, t + 1.2); o.frequency.linearRampToValueAtTime(60, t + 2.4);
  f.type = 'lowpass'; f.frequency.value = 420; a.gain.setValueAtTime(.001, t); a.gain.linearRampToValueAtTime(.05, t + 1); a.gain.linearRampToValueAtTime(.001, t + 2.6);
  o.connect(f).connect(a).connect(OUT); o.start(t); o.stop(t + 2.7);
}

class Main extends Phaser.Scene {
  constructor() { super('main'); }
  create() {
    buildFont(this); initAudio(this);
    const gg = this.make.graphics({ add: false }); gg.fillStyle(0xffffff).fillRect(0, 0, 4, 4); gg.generateTexture('dot', 4, 4); gg.destroy();
    this.g = this.add.graphics();
    this.gp = this.add.graphics().setDepth(10);
    this.hand = this.add.graphics().setDepth(40);
    this.gb = this.add.graphics().setDepth(45);
    this.gu = this.add.graphics().setDepth(55);
    const em = (tint, sp, life) => this.add.particles(0, 0, 'dot', { speed: { min: sp * .2, max: sp }, lifespan: life, gravityY: 520, scale: { start: 1.7, end: 0 }, tint, emitting: false }).setDepth(50);
    this.fxG = em([0xffffff, 0xbfefff, 0x9fd8f0], 360, 1100);
    this.fxD = em([0xd9cdb4, 0xbdb3a0], 120, 600);
    this.fxC = em([0xffd60a, 0x1d4ed8, 0xe63946], 420, 1600);
    this.big = txt(this, 400, 140, '', 6);
    this.sub = txt(this, 400, 202, '', 3);
    this.hint = txt(this, 400, 578, '', 2);
    this.hudL = txt(this, 14, 20, '', 2, 0xffffff, 0);
    this.hudR = txt(this, 786, 20, '', 2, 0xffffff, 1);
    this.say = txt(this, 400, 120, '', 2, 0xffffff);
    this.logo1 = txt(this, 400, 64, 'CHAPITA', 7, 0xffd60a);
    this.logo2 = txt(this, 400, 150, 'BRAVA', 7, 0xff4d4d);
    this.menu = txt(this, 400, 520, '', 2.5);
    this.tops = txt(this, 680, 400, '', 1.6, 0xffffff);
    drawHand(this.hand, 0);
    this.kids = KIDS0.map((k) => ({ x: k[0], y: k[1], tx: k[0], ty: k[1], ph: 0 }));
    this.marks = []; this.boxT = 0; this.nb = 2; this.nm = 12; this.freeze = 0;
    loadTop().then(() => this.refreshTop());
    this.refreshTop();
    if (window.__CHAPITA_COVER) return this.cover();
    this.attract();
  }
  get P() { return this.turn ? 'P2_' : 'P1_'; }
  refreshTop() { this.tops.setText('RECORDS\n' + (memTop || DEF_TOP).map((e, i) => i + 1 + ' ' + e.n + ' ' + String(e.s).padStart(5, ' ')).join('\n')); }
  showTitle(v) { for (const o of [this.logo1, this.logo2, this.menu, this.tops]) o.setVisible(v); for (const o of [this.hudL, this.hudR]) o.setVisible(!v); }
  flash(a, col, b, still) {
    this.big.setText(a).setTint(col || 0xffffff); this.sub.setText(b || '');
    if (!still) { this.big.setScale(9); this.tweens.add({ targets: this.big, scale: 6, duration: 260, ease: 'Back.Out' }); }
  }
  attract() {
    this.demo = 1; this.mode = 0; this.turn = 0; this.broke = 0; this.marks = [];
    this.pl = [{ s: 0, c: 10, n: 0, str: 0, so: 0 }];
    this.showTitle(1); this.flash('', 0, '', 1); this.hint.setText('');
    this.windup(.15);
  }
  start(m) {
    sfx('ui2'); unlock(); lastIn = now();
    this.demo = 0; this.mode = m; this.turn = 0; this.broke = 0; this.marks = [];
    this.pl = [0, 1].map(() => ({ s: 0, c: 10, n: 0, str: 0, so: 0 }));
    this.showTitle(0);
    this.flash(m == 2 ? 'TURNO J1' : '10 CHAPITAS', PCOL[0], 'B1 BATEA  B2 PODER');
    this.windup(1.3);
  }
  windup(d) {
    const p = this.pl[this.turn], out = !this.demo && p.n >= 3 && p.so >= 4 && rnd() < .5;
    p.so = out ? 0 : p.so + 1;
    this.p = this.demo ? { ty: 0, T: .55, xa: .2, za: 2.4, A: 0, D: 0, side: 1, xb: .2 } : makePitch(p.n, out);
    this.st = 'windup'; this.t = -d; this.sw = null; this.pend = null; this.cam = CAMW; this.trail = []; this.slow = 1; this.slowed = 0;
    this.kids.forEach((k, i) => { k.x = k.tx = KIDS0[i][0]; k.y = k.ty = KIDS0[i][1]; });
    this.say.setText(''); this.fl = null;
    drawHand(this.hand, 0);
  }
  update(time, delta) {
    const dt = min(delta, 50) / 1000;
    if (this.freeze > 0) { this.freeze -= dt; this.draw(0); clearTaps(); return; }
    this.t += dt;
    const st = this.st;
    if (this.demo && st != 'cover') {
      const m = tap.START2 || anyBtn('P2_') ? 2 : tap.START1 || anyBtn('P1_') ? 1 : 0;
      if (m) { this.start(m); return clearTaps(); }
    } else if (st != 'init' && st != 'over' && st != 'cover' && now() - lastIn > 20000) { this.attract(); return clearTaps(); }
    if (st == 'windup') { if (this.t >= .7) this.release(); }
    else if (st == 'pitch') this.uPitch();
    else if (st == 'fly') this.uFly(dt);
    else if (st == 'res') { if (this.t > this.resT || (this.t > .35 && !this.demo && (anyBtn(this.P) || tap.START1 || tap.START2))) this.next(); }
    else if (st == 'turn') { if (this.t > 1.8) { this.turn = 1; this.windup(.2); } }
    else if (st == 'over') { if (this.t > 3.2) this.toInit(); }
    else if (st == 'init') this.uInit();
    this.amb(dt);
    this.draw(dt);
    clearTaps();
  }
  amb(dt) {
    if ((this.nb -= dt) < 0) { this.nb = 2 + rnd() * 4; const f = 2400 + rnd() * 900; tone(f, 0, .07, 'sine', .025); tone(f * 1.2, .09, .06, 'sine', .02); }
    if ((this.nm -= dt) < 0) { this.nm = 16 + rnd() * 10; moto(); }
  }
  release() { this.flash('', 0, '', 1); this.st = 'pitch'; this.p.t0 = now(); this.t = 0; drawHand(this.hand, 1); sfx('swoosh'); }
  uPitch() {
    const p = this.p, n = now(), ta = p.t0 + p.T * 1000, u = (n - p.t0) / (p.T * 1000);
    if (u > .35 && this.t < 9) drawHand(this.hand, 0), this.t = 9;
    if (!this.sw) {
      const P = this.P;
      const b = this.demo ? (n >= ta - 8 ? 'D' : 0) : tap[P + '1'] ? P + '1' : tap[P + '2'] ? P + '2' : anyBtn(P);
      if (b) this.swing(b, ta);
    }
    if (this.pend && n >= this.pend.at) return this.hit();
    if (!this.pend && u >= 1 + 6 / R0.y) this.call();
  }
  swing(b, ta) {
    const P = this.P, d = this.demo, pl = this.pl[this.turn];
    const ts = d ? ta : stamp[b] + LAG, pw = !d && b.endsWith('2');
    const hz = d ? 2.4 : held[P + 'U'] ? 3.1 : held[P + 'D'] ? 1.6 : 2.35, dir = d ? 0 : (held[P + 'R'] ? 1 : 0) - (held[P + 'L'] ? 1 : 0);
    this.sw = { t0: now(), hz, pw };
    sfx('swoosh');
    const W = (pl.n < 3 ? 150 : 110) * (pw ? .62 : 1), dtms = ts - ta, zb = pitchPos(this.p, 1)[2];
    if (abs(dtms) > W) { this.sw.miss = dtms < 0 ? 'TEMPRANO' : 'TARDE'; return; }
    const pe = abs(zb - hz) / (pw ? .62 : .85);
    if (pe > 1) { this.sw.miss = zb > hz ? 'ERA ALTA' : 'ERA BAJA'; return; }
    const q = clamp(1 - .5 * (dtms / W) ** 2 - .5 * pe * pe, 0, 1);
    this.pend = d ? { at: ta, q: 1, r: DEMO, zb } : { at: max(now(), ta), q, zb, r: [(28 + 44 * q + (pw ? 10 : 0)) * MPH, clamp(16 + (zb - hz) * 26 + (pw ? 5 : 0) + (rnd() - .5) * 14, -12, 58), dtms / W * 14 + dir * 7 + (rnd() - .5) * 6] };
  }
  hit() {
    const h = this.pend, r = simHit(h.r[0], h.r[1], h.r[2], h.zb);
    this.pend = null; this.fl = r; this.gl = 0; this.ft = 0; this.fi = 0; this.evI = 0;
    this.st = 'fly'; this.t = 0; this.cam = camS(); this.freeze = .07;
    sfx('toc'); this.cameras.main.shake(150, .004 + h.q * .012);
    const last = r.path[r.path.length - 1];
    if (r.k == 'OUT' && r.kid >= 0) { const k = this.kids[r.kid]; k.tx = last[0]; k.ty = last[1]; }
    else if (r.land) this.kids.forEach((k) => { k.tx = lerp(k.x, r.land.x, .6); k.ty = lerp(k.y, r.land.y, .6); });
  }
  uFly(dt) {
    const r = this.fl, P = r.path;
    if (r.k == 'JONRON' && !this.demo && !this.slowed && this.fi > P.length * .5) { this.slowed = 1; this.slow = .4; }
    this.ft += dt * this.slow; this.fi = min(P.length - 1, this.ft * 60 | 0);
    while (this.evI < r.ev.length && r.ev[this.evI][1] <= this.fi) this.evt(r.ev[this.evI++][0], P[r.ev[this.evI - 1][1]]);
    const b = P[this.fi], c = this.cam, k = 1 - Math.exp(-dt * 2.6);
    c.y = lerp(c.y, clamp(b[1] - 45, -16, FY - 80), k); c.z = lerp(c.z, max(9.5, b[2] * .6 + 5), k);
    c.p = lerp(c.p, clamp(Math.atan2(b[2] - c.z, max(12, b[1] - c.y)) * .6, -.05, .35), k);
    if (this.fi >= P.length - 1) {
      if (r.broke && !this.gl) { this.gl = 1; this.glass(); }
      if (this.t > (this.fi + 1) / 60 / this.slow - .01 || this.fi >= P.length - 1) this.result(r);
    }
  }
  evt(e, q) {
    const s = q && proj(this.cam, q[0], q[1], q[2]);
    if (e == 'car') { sfx('box'); for (let i = 0; i < 4; i++) tone(i % 2 ? 900 : 1250, i * .22, .18, 'square', .05); }
    if (e == 'wall' || e == 'side' || e == 'poste') sfx('clk');
    if (e == 'land' && s) { this.fxD.explode(10, s[0], s[1]); sfx('clk'); }
  }
  glass() {
    this.broke = 1; this.scr = now() + 2600; sfx('glass'); this.time.delayedCall(220, () => sfx('scream'));
    const p = proj(this.cam, 0, FY - .3, (WIN.z0 + WIN.z1) / 2);
    if (p) { this.fxG.explode(60, p[0], p[1]); this.fxC.explode(50, p[0], p[1] - 40); }
    this.cameras.main.shake(400, .014); this.cameras.main.flash(180, 255, 255, 240);
    this.say.setText('ME PAGAS ESE VIDRIO!');
  }
  result(r) {
    const p = this.pl[this.turn], k = r.k;
    let pts = 0, a = k, b = '';
    if (k == 'JONRON') { pts = r.ft + 100 + (r.broke ? 200 : 0); a = '^SE FUE!'; b = r.ft + ' PIES' + (r.broke ? ' +VIDRIO' : ''); this.fxC.explode(80, 400, 200); this.cameras.main.flash(160, 255, 250, 200); }
    else if (k != 'FOUL' && k != 'OUT') { pts = r.ft; b = r.ft + ' PIES'; }
    if (k == 'OUT') sfx('uuh'); else if (pts) sfx('ui2');
    p.str = pts ? p.str + 1 : 0;
    if (p.str == 3 && !this.demo) b = 'CUARTO BATE! ' + b;
    if (this.demo) { a = ''; b = ''; }
    this.endPitch(pts, a, b, RCOL[k], k == 'JONRON' ? 2.6 : 1);
  }
  endPitch(pts, a, b, col, dur, ball) {
    const p = this.pl[this.turn];
    if (!this.demo) { p.n++; if (!ball) { p.s += pts; p.c--; } }
    this.flash(a, col, b); this.st = 'res'; this.t = 0; this.resT = dur;
  }
  call() {
    const p = this.p, e = pitchPos(p, 1), w = pitchPos(p, 1 + 6 / R0.y), sw = this.sw;
    if (abs(w[0] - CATCH_X) < 2.4 && w[2] < 4.6) { sfx('box'); this.boxT = .35; } else { sfx('clk'); this.marks.push([w[0], w[2]]); }
    this.pl[this.turn].str = 0;
    if (sw) { sfx('strike'); this.endPitch(0, 'ABANICO!', sw.miss, 0xff5d5d, 1.1); }
    else if (inSquare(e[0], e[2])) { sfx('strike'); this.endPitch(0, 'STRIKE', 'SE LA DEJO PASAR', 0xff5d5d, 1.1); }
    else this.endPitch(0, 'BOLA', 'NO CUENTA', 0xffffff, .9, 1);
  }
  next() {
    this.flash('', 0, '', 1); this.say.setText('');
    if (this.demo) { this.broke = 0; return this.windup(1.4); }
    if (this.pl[this.turn].c > 0) return this.windup(.2);
    if (this.mode == 2 && !this.turn) { this.st = 'turn'; this.t = 0; this.broke = 0; this.marks = []; this.cam = CAMW; return this.flash('TURNO J2', PCOL[1], 'J1 HIZO ' + this.pl[0].s + ' PIES'); }
    this.over();
  }
  over() {
    const [a, b] = this.pl;
    this.st = 'over'; this.t = 0;
    if (this.mode == 2) this.flash(a.s == b.s ? 'EMPATE' : a.s > b.s ? 'GANA J1' : 'GANA J2', 0xffd60a, a.s + ' VS ' + b.s + ' PIES');
    else this.flash('FIN', 0xffd60a, a.s + ' PIES');
    this.initQ = (this.mode == 2 ? [0, 1] : [0]).filter((i) => qualifies(this.pl[i].s));
  }
  toInit() {
    if (!this.initQ.length) return this.attract();
    this.ip = this.initQ.shift(); this.st = 'init'; this.t = 0; this.L = [0, 0, 0]; this.lp = 0; this.it = now();
  }
  uInit() {
    const P = this.ip ? 'P2_' : 'P1_', L = this.L;
    let mv = 1;
    if (tap[P + 'U']) L[this.lp] = (L[this.lp] + 1) % 26;
    else if (tap[P + 'D']) L[this.lp] = (L[this.lp] + 25) % 26;
    else if (tap[P + 'R']) this.lp = min(2, this.lp + 1);
    else if (tap[P + 'L']) this.lp = max(0, this.lp - 1);
    else if (tap[P + '1'] || tap[this.ip ? 'START2' : 'START1']) { if (this.lp < 2) this.lp++; else { sfx('ui2'); return this.saveInit(); } }
    else mv = 0;
    if (mv) { this.it = now(); sfx('ui'); }
    if (now() - this.it > 15000) return this.saveInit();
    this.flash('RECORD J' + (this.ip + 1), PCOL[this.ip], L.map((l) => ABC[l]).join(' '), 1);
  }
  saveInit() {
    const e = { n: this.L.map((l) => ABC[l]).join(''), s: this.pl[this.ip].s };
    saveTop((memTop || DEF_TOP).concat([e]).sort((a, b) => b.s - a.s).slice(0, 5));
    this.refreshTop(); this.toInit();
  }
  cover() {
    this.st = 'cover'; this.scr = 1e15; this.demo = 1; this.mode = 0; this.turn = 0; this.broke = 1; this.marks = []; this.pl = [{ s: 0, c: 10, n: 0 }];
    this.cam = { x: 0, y: FY - 78, z: 10, d: 1, p: .1, f: 640, cx: 400, cy: 420 };
    this.fl = { path: [[0, -99, 0]] }; this.fi = 0; this.sw = { t0: -1e9, hz: 2.4 };
    this.showTitle(0); this.tops.setVisible(0);
    this.logo1.setVisible(1).setY(70); this.logo2.setVisible(1).setY(158);
    this.say.setText('ME PAGAS ESE VIDRIO!');
    txt(this, 175, 568, '1-2 JUGADORES', 2.2, 0xffd60a);
    txt(this, 615, 568, 'BATEA: BOTON 1', 2.2, 0xffffff);
  }
  draw(dt) {
    const g = this.g, gp = this.gp, gb = this.gb, gu = this.gu, c = this.cam, n = now(), P = this.p;
    g.clear(); gp.clear(); gb.clear(); gu.clear();
    drawWorld(g, c, this);
    const shirt = this.turn ? 0x57d3ff : 0xffffff;
    if (c.d < 0) {
      for (const m of this.marks) { const q = proj(c, m[0], -5.9, m[1]); if (q) g.fillStyle(0x6b6b6b, .55).fillEllipse(q[0], q[1], .55 * q[2], .45 * q[2]); }
      this.boxT -= dt;
      const pc = proj(c, CATCH_X, -4.3, 0); dude(gp, pc[0], pc[1], pc[2], { sh: 0x2a9d8f, pa: 0x264653, sk: SKIN[1], ha: 0x1b1b1b, cr: 1, box: this.boxT > 0 ? 2 : 1, hx: .2, hy: 2.2 });
      let br = -2.15, hx = -.15, hy = 4.6;
      if (this.sw) {
        const k = clamp((n - this.sw.t0) / 210, 0, 1), z = this.sw.hz + .2;
        if (k < .6) { const e = ease(k / .6); br = lerp(-2.15, 0, e); hx = lerp(-.15, .7, e); hy = lerp(4.6, z, e); }
        else { const e = ease((k - .6) / .4); br = lerp(0, -.9, e); hx = lerp(.7, .5, e); hy = lerp(z, 4.2, e); }
      }
      const pb = proj(c, BAT_X, .3, 0); dude(gp, pb[0], pb[1], pb[2], { sh: shirt, pa: 0xe63946, sk: SKIN[0], ha: 0x2b1a10, br, hx, hy, num: this.turn });
      // mano del pitcher con la pista del lanzamiento
      const rp = proj(c, R0.x, R0.y, R0.z), w = this.st == 'windup' ? clamp(this.t / .4, 0, 1) : 0;
      const rot = -.25 + (P.ty == 1 ? P.side * .4 * w + sin(n / 30) * .03 * w : 0), dy = P.ty == 2 ? 16 * w : 0;
      const fx = 36 * cos(rot) + 16 * sin(rot), fy = 36 * sin(rot) - 16 * cos(rot);
      this.hand.setVisible(1).setRotation(rot).setPosition(rp[0] - fx, rp[1] - fy + dy);
      if (this.st == 'windup') chapita(gb, rp[0], rp[1] + dy, 30, P.ty == 1 ? 1.1 * P.side : 0, 1);
      if (this.st == 'pitch' || (this.st == 'res' && this.t < .3 && !this.fl)) {
        const u = (n - P.t0) / (P.T * 1000), q = pitchPos(P, min(u, 1 + 6 / R0.y)), s = proj(c, q[0], q[1], q[2]), sh = proj(c, q[0], q[1], 0);
        if (s) {
          const d = clamp(.55 * s[2], 16, 34);
          if (sh) gb.fillStyle(0, .25).fillEllipse(sh[0], sh[1], d, d * .3);
          this.trail.push([s[0], s[1], d]); if (this.trail.length > 5) this.trail.shift();
          this.trail.forEach((t, i) => gb.fillStyle(0xffffff, .12 * i).fillEllipse(t[0], t[1], t[2] * .8, t[2] * .8));
          chapita(gb, s[0], s[1], d, n / 40, 1);
          if (!this.demo && this.pl[this.turn].n < 3 && u < 1) {
            const e = pitchPos(P, 1), tp = proj(c, e[0], e[1], e[2]);
            gb.lineStyle(4, 0xffd60a, .9).strokeCircle(tp[0], tp[1], max(16, .55 * tp[2]) / 2 + 80 * (1 - u));
          }
        }
      }
    } else {
      this.hand.setVisible(0);
      for (const k of this.kids) {
        const dx = k.tx - k.x, dy = k.ty - k.y, dd = hyp(dx, dy), mv = min(dd, 15 * dt * this.slow);
        if (dd > .1) { k.x += dx / dd * mv; k.y += dy / dd * mv; k.ph += dt * 14; }
      }
      this.kids.forEach((k, i) => { const p = k.y - c.y > 12 && proj(c, k.x, k.y, 0); if (p) dude(gp, p[0], p[1], p[2], { sh: i ? 0xe63946 : 0xffd60a, pa: 0x264653, sk: SKIN[2 + i], ha: 0x1b1b1b, arms: [2.3, .85], cr: .3, run: hyp(k.tx - k.x, k.ty - k.y) > .2 ? k.ph : null }); });
      const pp = 30 - c.y > 16 && proj(c, -.5, 30, 0); if (pp) dude(gp, pp[0], pp[1], pp[2], { sh: 0x2a9d8f, pa: 0x8d99ae, sk: SKIN[1], ha: 0x1b1b1b, cap: 0x1d4ed8, arms: [2, .4] });
      const wp = proj(c, 0, FY - .4, WIN.z0 + 1.6);
      if (wp) {
        vecina(gp, wp[0], wp[1], wp[2], n < this.scr);
        if (this.broke) {
          const q = proj(c, 0, FY - .5, (WIN.z0 + WIN.z1) / 2);
          for (let i = 0; i < 9; i++) { const a = i * .7 + .3, r = (WIN.x1 - WIN.x0) * .5 * q[2]; gp.lineStyle(2, 0xffffff, .9).lineBetween(q[0], q[1], q[0] + cos(a) * r * (.5 + (i % 3) * .25), q[1] + sin(a) * r * .55); }
          const tp = proj(c, 0, FY - .5, WIN.z1 + 1.2); if (this.st != 'cover') this.say.setPosition(clamp(wp[0], 170, 630), max(60, tp[1] - 26)); else this.say.setPosition(445, 466);
        }
      }
      const pb = proj(c, BAT_X, 1, 0); if (pb) dude(gp, pb[0], pb[1], pb[2], { sh: shirt, pa: 0xe63946, sk: SKIN[0], ha: 0x2b1a10, br: .9, hx: -.6, hy: 3, back: 1 });
      if (this.fl) {
        const b = this.fl.path[this.fi], s = proj(c, b[0], b[1], b[2]), sh = proj(c, b[0], b[1], 0);
        if (sh) gb.fillStyle(0, .3).fillEllipse(sh[0], sh[1], max(6, .6 * sh[2]), max(2, .2 * sh[2]));
        if (s && !(this.broke && this.fi >= this.fl.path.length - 1 && this.fl.broke)) chapita(gb, s[0], s[1], max(10, .55 * s[2]), n / 35, 1);
      }
    }
    if (this.say.text) { const b = this.say.getBounds(); gu.fillStyle(0xffffff, .95).fillRoundedRect(b.x - 10, b.y - 8, b.width + 20, b.height + 16, 10).fillTriangle(b.centerX - 12, b.bottom + 7, b.centerX + 12, b.bottom + 7, b.centerX, b.bottom + 24); this.say.setTint(0xd62828).setDepth(56); }
    if (this.tops.visible) { const b = this.tops.getBounds(); gu.fillStyle(0, .45).fillRoundedRect(b.x - 10, b.y - 8, b.width + 20, b.height + 16, 8); }
    if (this.st == 'cover') {
      gu.lineStyle(6, 0xffffff, .8);
      for (let i = 0; i < 5; i++) gu.lineBetween(60 + i * 12, 560 - i * 22, 290 + i * 4, 420 - i * 8);
      chapita(gu, 320, 410, 74, .5, 1);
      gu.fillStyle(0xffffff);
      for (let i = 0; i < 26; i++) { const a = i * 2.4, rr = 50 + (i * 37) % 70; gu.fillRect(400 + cos(a) * rr * 1.6, 235 + sin(a) * rr * .7, 6, 3 + i % 4); }
    }
    // HUD y titulo
    if (this.demo) {
      if (this.st != 'cover') this.menu.setText((n / 700 | 0) % 2 ? 'START 2: 2 JUGADORES' : 'PRESIONA UN BOTON');
    } else if (this.mode) {
      const p = this.pl[this.turn];
      this.hudL.setText('J' + (this.turn + 1) + '  ' + p.s + ' PIES').setTint(PCOL[this.turn]);
      this.hudR.setText(this.mode == 2 ? 'J1 ' + this.pl[0].s + '  J2 ' + this.pl[1].s : 'REC ' + (memTop || DEF_TOP)[0].n + ' ' + (memTop || DEF_TOP)[0].s);
      for (let i = 0; i < 10; i++) chapita(gu, 26 + i * 22, 52, 16, 0, i < p.c ? 1 : .25);
      this.hint.setText(p.n < 3 && (this.st == 'windup' || this.st == 'pitch') ? 'B1 BATEA  B2 PODER  JOY ALTURA' : '');
      if (this.st == 'init') { const x = 400 - 75 + this.lp * 60; gu.fillStyle(PCOL[this.ip]).fillRect(x, 224, 30, 4); }
    }
    this.hudL.setVisible(!!this.mode && !this.demo); this.hudR.setVisible(!!this.mode && !this.demo);
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO, width: W, height: H, parent: 'game-root', backgroundColor: '#63b8ff',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { keyboard: false }, scene: [Main],
});
if (window.__CHAPITA_COVER || window.__CHAPITA_BOT) window.__chapitaGame = game;
})();
