// Tests de la escena (BL-091): la estética de mi sitio, solo con el theme Gato Negro.
// ESC-1 fondo, cápsula y paneles; ESC-2 mi globo con el gato y el consejo adentro.
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const css = read('css/escena.css');
const js = read('js/escena.js');
const E = require('../js/escena.js');

// Reglas sueltas (fuera de @keyframes), con @media desarmado.
function reglas(src) {
  const sinComentarios = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const sinKeyframes = sinComentarios.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const sinMedia = sinKeyframes.replace(/@media[^{]+\{([\s\S]*?\})\s*\}/g, '$1');
  return [...sinMedia.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2] }));
}
const regla = sel => reglas(css).find(r => r.sel === sel);

// Contraste WCAG
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const over = (c, a, b) => c.map((v, i) => v * a + b[i] * (1 - a));
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// Peor caso del fondo: el theme + luz violeta + línea de la cuadrícula.
const BASE = over([255, 255, 255], 0.03, over([168, 150, 255], 0.16, hex('#0F1117')));
const MUTED = over(hex('#8E96A3'), 0.8, hex('#F4F6FA')); // --gn-muted

test('chispas: tantas como se piden, con su índice, y con tope', () => {
  assert.equal(E.chispasHTML(3), '<i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i>');
  assert.equal(E.chispasHTML(0), '');
  assert.equal(E.chispasHTML(-5), '');
  assert.equal((E.chispasHTML(500).match(/<i /g) || []).length, 40);
  assert.equal((E.chispasHTML(E.CHISPAS).match(/<i /g) || []).length, 14);
});

test('solo cambia el theme Gato Negro: toda regla cuelga de body[data-theme="gato"]', () => {
  const rs = reglas(css);
  assert.ok(rs.length >= 40, 'se leyeron las reglas (' + rs.length + ')');
  const sueltas = [];
  for (const r of rs) {
    for (const s of r.sel.split(',').map(x => x.trim())) {
      if (s.startsWith('body[data-theme="gato"]')) continue;
      assert.ok(/^\.esc-[a-z-]+$/.test(s) && /^\s*display:\s*none;\s*$/.test(r.body), 'regla sin scope: ' + s);
      sueltas.push(s);
    }
  }
  assert.deepEqual(sueltas, ['.esc-chispas', '.esc-globo'], 'lo único suelto es esconder lo nuevo');
});

test('la cabecera no gana backdrop-filter, filter ni transform (los menús fixed del celular siguen en su lugar)', () => {
  assert.ok(!/backdrop-filter/.test(css.replace(/\/\*[\s\S]*?\*\//g, '')));
  for (const r of reglas(css).filter(x => /\.app-header/.test(x.sel))) assert.ok(!/(filter|transform|will-change|contain)\s*:/.test(r.body), r.sel);
});

test('el fondo y las chispas no tapan ni atrapan clics', () => {
  const fondo = regla('body[data-theme="gato"]::before');
  assert.ok(fondo && /position:\s*fixed/.test(fondo.body) && /z-index:\s*-1/.test(fondo.body) && /pointer-events:\s*none/.test(fondo.body));
  const ch = regla('body[data-theme="gato"] .esc-chispas');
  assert.ok(ch && /position:\s*fixed/.test(ch.body) && /z-index:\s*-1/.test(ch.body) && /pointer-events:\s*none/.test(ch.body));
});

test('contraste: pestaña activa, paneles y cabecera sobre el punto más claro del fondo', () => {
  const tab = regla('body[data-theme="gato"] .app-tab[aria-current="true"]');
  const bg = /background:\s*(#[0-9A-Fa-f]{6})/.exec(tab.body)[1], fg = /color:\s*(#[0-9A-Fa-f]{6})/.exec(tab.body)[1];
  assert.ok(cr(hex(fg), hex(bg)) >= 7, 'pestaña activa ' + cr(hex(fg), hex(bg)).toFixed(2));
  const panel = over(hex('#1A1F2B'), 0.9, BASE);
  assert.match(css, /\.gn-panel \{\s*background: rgba\(26, 31, 43, \.9\)/);
  assert.ok(cr(hex('#F4F6FA'), panel) >= 4.5, 'texto');
  assert.ok(cr(MUTED, panel) >= 4.5, 'texto secundario ' + cr(MUTED, panel).toFixed(2));
  const header = over(hex('#0F1117'), 0.9, BASE);
  assert.match(css, /\.app-header \{ background: rgba\(15, 17, 23, \.9\); \}/);
  assert.ok(cr(MUTED, header) >= 4.5, 'pestañas sobre la cabecera');
});

test('cada panel con el color de su sección y entrando en orden', () => {
  ['seccionWidgets', 'seccionFavoritos', 'seccionCategorias', 'launcherPanel'].forEach((id, i) => {
    const r = regla('body[data-theme="gato"] #' + id);
    assert.ok(r, id);
    assert.match(r.body, /--esc-color:\s*#[0-9A-Fa-f]{6}/);
    assert.match(r.body, new RegExp('--esc-orden:\\s*' + (i + 1) + ';'));
  });
});

test('«reducir movimiento»: sin chispas, entradas ni saltos del gato', () => {
  const m = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?\})\s*\}/.exec(css);
  assert.ok(m);
  assert.match(m[1], /\.esc-chispas \{ display: none; \}/);
  assert.match(m[1], /\.gn-panel \{ animation: none; \}/);
  assert.match(m[1], /\.esc-globo \{ animation: none; \}/);
  assert.match(m[1], /\.esc-gato\.is-salta img \{ animation: none; \}/);
});

// ---- ESC-2: el globo ----
test('el consejo va a mi globo solo con el theme Gato Negro', () => {
  assert.equal(E.dondeConsejo('gato'), 'globo');
  for (const t of ['boveda', 'nord', 'notion', '', null, undefined, 'random']) assert.equal(E.dondeConsejo(t), 'franja', String(t));
});

test('plegado: con consejo siempre abierto; sin consejo, como lo dejaste (la primera vez, abierto)', () => {
  assert.equal(E.plegadoInicial(null, false), false);
  assert.equal(E.plegadoInicial({}, false), false);
  assert.equal(E.plegadoInicial({ plegado: true }, false), true);
  assert.equal(E.plegadoInicial({ plegado: 'true' }, false), false, 'solo un true de verdad');
  assert.equal(E.plegadoInicial({ plegado: false }, false), false);
  assert.equal(E.plegadoInicial({ plegado: true }, true), false, 'un consejo lo abre');
});

test('lo que digo sin consejo: el saludo según la hora', () => {
  const a = h => E.lineaDelDia(new Date(2026, 10, 17, h, 30));
  assert.equal(a(4), 'Buenas noches, Pablo. Ctrl K y te llevo a donde quieras.');
  assert.match(a(5), /^Buen día, Pablo\./);
  assert.match(a(11), /^Buen día/);
  assert.match(a(12), /^Buenas tardes/);
  assert.match(a(18), /^Buenas tardes/);
  assert.match(a(19), /^Buenas noches/);
});

test('el gato: cuatro frases que rotan y, al quinto toque, la queja', () => {
  assert.equal(E.fraseGato(0), '');
  assert.deepEqual([1, 2, 3, 4].map(E.fraseGato), E.FRASES);
  assert.equal(E.fraseGato(5), E.QUEJA);
  assert.equal(E.fraseGato(6), E.FRASES[0]);
  assert.equal(E.fraseGato(9), E.FRASES[3]);
  assert.equal(E.fraseGato(10), E.FRASES[0]);
});

test('el globo: gato con botón, mi cara, el lugar del consejo y el botón de plegar; todas las imágenes existen', () => {
  const h = E.globoHTML('Hola');
  assert.match(h, /<button type="button" class="esc-gato" aria-label="Tocar al gato robot">/);
  assert.match(h, /class="esc-gato-dice" aria-live="polite"/);
  assert.match(h, /<p class="esc-texto">Hola<\/p>/);
  assert.match(h, /<div class="esc-slot"><\/div>/);
  assert.match(h, /class="esc-plegar" aria-expanded="true" aria-label="Plegar mi globo"/);
  const srcs = [...h.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  assert.equal(srcs.length, 2);
  for (const s of srcs) assert.ok(fs.existsSync(path.join(ROOT, s)), s);
  for (const pose of ['sentado', 'festeja']) assert.ok(fs.existsSync(path.join(ROOT, 'assets/brand/gato/gato-' + pose + '.webp')), pose);
  assert.match(js, /gato\('festeja', fraseGato\(toques\)\)/);
});

test('el globo queda debajo del portal, del editor y de los avisos, y no tapa la página', () => {
  const g = regla('body[data-theme="gato"] .esc-globo');
  assert.match(g.body, /position: fixed;/);
  const z = +/z-index: (\d+)/.exec(g.body)[1];
  assert.ok(z < 9000, 'portal 9000, editor 10000, avisos 10002');
  assert.ok(z > 120, 'por encima de los menús y la cabecera');
  assert.match(regla('body[data-theme="gato"] .app-main').body, /padding-bottom: 150px;/);
  assert.match(regla('body[data-theme="gato"]:has(details.gn-menu[open]) .esc-globo').body, /display: none;/);
});

test('el consejo adentro del globo: sin posición propia y con su cara; el globo no repite la mía', () => {
  const t = regla('body[data-theme="gato"] .esc-slot .gn-toast');
  assert.match(t.body, /position: static;/);
  assert.match(t.body, /box-shadow: none;/);
  assert.match(regla('body[data-theme="gato"] .esc-slot .gn-toast[hidden]').body, /display: none;/);
  const sels = reglas(css).filter(r => /display: none;/.test(r.body)).map(r => r.sel).join('\n');
  for (const c of ['.esc-cara', '.esc-nombre', '.esc-texto']) assert.ok(sels.includes('.esc-globo.con-consejo ' + c), c);
});

test('contraste del globo: texto, mi nombre y lo que dice el gato', () => {
  const g = regla('body[data-theme="gato"] .esc-globo');
  assert.match(g.body, /background: rgba\(26, 31, 43, \.97\);/);
  const fondo = over(hex('#1A1F2B'), 0.97, BASE);
  assert.ok(cr(hex('#F4F6FA'), fondo) >= 4.5, 'texto');
  const nombre = /color: (#[0-9A-Fa-f]{6})/.exec(regla('body[data-theme="gato"] .esc-nombre').body)[1];
  assert.ok(cr(hex(nombre), fondo) >= 4.5, 'nombre ' + cr(hex(nombre), fondo).toFixed(2));
  const d = regla('body[data-theme="gato"] .esc-gato-dice').body;
  assert.ok(cr(hex(/color: (#[0-9A-Fa-f]{6})/.exec(d)[1]), hex(/background: (#[0-9A-Fa-f]{6})/.exec(d)[1])) >= 7);
});

test('escena.js no sale a la red, guarda solo { plegado } en su clave y no repite el globo', () => {
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/fetch|XMLHttpRequest|sessionStorage|cookie/.test(codigo));
  assert.equal(E.KEY, 'guarida:escena:v1');
  assert.deepEqual([...codigo.matchAll(/localStorage\.(\w+)\(/g)].map(m => m[1]).sort(), ['getItem', 'setItem']);
  assert.match(codigo, /localStorage\.setItem\(KEY, JSON\.stringify\(v\)\)/);
  assert.deepEqual([...codigo.matchAll(/store\(([^)]*)\)/g)].map(m => m[1]).filter(a => a !== 'v'), ['{ plegado: si }']);
  assert.match(codigo, /if \(\$\('\.esc-globo'\)\) return;/);
  assert.match(codigo, /if \(!\$\('\.esc-chispas'\)\)/);
  assert.match(codigo, /setAttribute\('aria-hidden', 'true'\)/);
});

test('el consejo sigue al theme y a shiruvana.js: observo data-theme, #ghTip y el hidden del consejo', () => {
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(codigo, /observe\(doc\.body, \{ attributes: true, attributeFilter: \['data-theme'\] \}\)/);
  assert.match(codigo, /observe\(tip, \{ childList: true \}\)/);
  assert.match(codigo, /attributeFilter: \['hidden'\], subtree: true/);
  assert.match(codigo, /if \(hay && !antes\) plegar\(false, false\);/, 'un consejo nuevo abre el globo sin pisar lo guardado');
  assert.match(codigo, /if \(t && dest && t\.parentNode !== dest\) dest\.appendChild\(t\);/, 'sin mover de más (no hay bucle con #ghTip)');
});

test('index.html carga la escena al final y con versión', () => {
  const html = read('index.html');
  const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  assert.equal(links[links.length - 1], 'css/escena.css?v=' + E.VERSION);
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  assert.equal(scripts[scripts.length - 1], 'js/escena.js?v=' + E.VERSION);
  assert.match(css, new RegExp('\\(' + E.VERSION.replace(/\./g, '\\.') + ', '));
});
